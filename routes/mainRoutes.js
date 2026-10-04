import express from "express";
import { getLandingPage } from "../controllers/mainController.js";

const router = express.Router();

router.get("/", getLandingPage);

export default router;
