import express from "express";
import { loginOrSignup, getCurrentUserTeam } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import {
  getListedPlayers,
  listPlayerForSale,
  buyPlayer,
  removeListing
} from "../controllers/marketController.js";

const router = express.Router();

// User authentication
router.post("/login", loginOrSignup);
router.get("/", auth, getCurrentUserTeam);

// Transfer Market routes
router.get("/market", auth, getListedPlayers);
router.get("/my-listings", auth, (req, res) => {
  req.query.mine = "true";
  getListedPlayers(req, res);
});
router.post("/list-player", auth, listPlayerForSale);
router.post("/buy-player", auth, buyPlayer);
router.post("/remove-listing", auth, removeListing);

export default router;

