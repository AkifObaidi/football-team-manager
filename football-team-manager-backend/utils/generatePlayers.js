import { db } from "../db.js";
import fs from "fs";
import path from "path";

const playersFile = path.join(process.cwd(), "data", "players.json");
const playerData = JSON.parse(fs.readFileSync(playersFile, "utf-8"));

const positions = { GK: 3, DEF: 6, MID: 6, ATT: 5 };

const getRandomPlayer = (position) => {
  const list = playerData[position];
  return list[Math.floor(Math.random() * list.length)];
};

export const generatePlayersAsync = async (teamId) => {
  try {
    const playerInserts = [];

    for (let pos in positions) {
      for (let i = 0; i < positions[pos]; i++) {
        const player = getRandomPlayer(pos);
        playerInserts.push([teamId, player.name, pos, player.team]);
      }
    }

    const sql = "INSERT INTO players (team_id, name, position, team_name) VALUES ?";
    await db.query(sql, [playerInserts]);

  } catch (err) {
    console.error(err);
  }
};

