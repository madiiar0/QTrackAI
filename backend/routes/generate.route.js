import express from "express";
import {verifyToken} from "../middleware/verifyToken.js";
import {generateExam, generateStatusGet} from "../controllers/generate.controllers.js";

const router = express.Router();

router.post('/', verifyToken, generateExam);
router.get('/status/:jobId', verifyToken, generateStatusGet);

export default router;
