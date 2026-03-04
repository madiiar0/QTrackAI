import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {promptGet, promptPost} from "../controllers/prompt.controllers.js";

const router = express.Router();

router.post('/', verifyToken, promptPost);
router.get('/', verifyToken, promptGet);

export default router;