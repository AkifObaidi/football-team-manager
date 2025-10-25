import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { generatePlayersAsync } from "../utils/generatePlayers.js";

export const loginOrSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ status: "failed", message: "Email and password required" });

    // Check if user exists
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (user) {
      // Login flow
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ status: "failed", message: "Invalid password" });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(200).json({ status: "success", message: "Logged in successfully", token });
    } else {
      // Signup flow
      const hashed = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashed]
      );

      const userId = result.insertId;

      // Create team for new user
      const [teamResult] = await db.query("INSERT INTO teams (user_id) VALUES (?)", [userId]);
      const teamId = teamResult.insertId;

      // Generate players asynchronously
      generatePlayersAsync(teamId);

      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(201).json({ status: "success", message: "Account created", token });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "failed", message: "Server error" });
  }
};

export const getCurrentUserTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [userRows] = await db.query("SELECT email FROM users WHERE id = ?", [userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ status: "failed", message: "User not found" });

    // Get team
    const [teamRows] = await db.query("SELECT * FROM teams WHERE user_id = ?", [userId]);
    const team = teamRows[0];
    if (!team) return res.status(404).json({ status: "failed", message: "Team not found" });

    // Get players
    const [players] = await db.query("SELECT * FROM players WHERE team_id = ?", [team.id]);

    res.json({ status: "success", email: user.email, team, players });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failed", message: "Server error" });
  }
};

export const getListedPlayers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, team, minPrice, maxPrice, mine } = req.query;

    let sql = `
      SELECT p.id, p.name, p.position, p.team_name, p.asking_price, t.id AS team_id
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.is_listed = 1
    `;
    const params = [];

    if (mine === "true") {
      const [teamRows] = await db.query("SELECT id FROM teams WHERE user_id = ?", [userId]);
      const teamId = teamRows[0]?.id;
      if (!teamId) return res.status(404).json({ message: "Team not found" });

      sql += " AND p.team_id = ?";
      params.push(teamId);
    }

    if (name) {
      sql += " AND p.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (team) {
      sql += " AND p.team_name LIKE ?";
      params.push(`%${team}%`);
    }
    if (minPrice) {
      sql += " AND p.asking_price >= ?";
      params.push(minPrice);
    }
    if (maxPrice) {
      sql += " AND p.asking_price <= ?";
      params.push(maxPrice);
    }

    const [players] = await db.query(sql, params);
    res.json({ players });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const listPlayerForSale = async (req, res) => {
  try {
    const { playerId, asking_price } = req.body;
    const userId = req.user.id;

    const [teamRows] = await db.query("SELECT id FROM teams WHERE user_id = ?", [userId]);
    const teamId = teamRows[0]?.id;
    if (!teamId) return res.status(404).json({ message: "Team not found" });

    const [playerRows] = await db.query("SELECT * FROM players WHERE id = ? AND team_id = ?", [playerId, teamId]);
    if (!playerRows[0]) return res.status(404).json({ message: "Player not found in your team" });

    const [countRows] = await db.query("SELECT COUNT(*) AS count FROM players WHERE team_id = ? AND is_listed = 0", [teamId]);
    if (countRows[0].count <= 15) return res.status(400).json({ message: "You must have at least 15 players" });

    await db.query("UPDATE players SET is_listed = 1, asking_price = ? WHERE id = ?", [asking_price, playerId]);
    res.json({ message: "Player listed for sale" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const buyPlayer = async (req, res) => {
  try {
    const { playerId } = req.body;
    const userId = req.user.id;

    const [teamRows] = await db.query("SELECT id, balance FROM teams WHERE user_id = ?", [userId]);
    const buyerTeam = teamRows[0];
    if (!buyerTeam) return res.status(404).json({ message: "Buyer team not found" });

    const [playerRows] = await db.query(`
      SELECT p.*, t.id AS seller_team_id
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.id = ? AND p.is_listed = 1
    `, [playerId]);
    const player = playerRows[0];
    if (!player) return res.status(404).json({ message: "Player not available" });

    const price = player.asking_price * 0.95;
    if (buyerTeam.balance < price) return res.status(400).json({ message: "Insufficient balance" });

    await db.query("UPDATE teams SET balance = balance - ? WHERE id = ?", [price, buyerTeam.id]);
    await db.query("UPDATE teams SET balance = balance + ? WHERE id = ?", [price, player.seller_team_id]);
    await db.query("UPDATE players SET team_id = ?, is_listed = 0, asking_price = NULL WHERE id = ?", [buyerTeam.id, playerId]);

    res.json({ message: "Player bought successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
