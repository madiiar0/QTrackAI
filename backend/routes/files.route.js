import express from 'express';
import {promptPost} from "../controllers/prompt.controllers.js";
import {filesGet, filesPost} from "../controllers/files.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js";
import {uploadFile} from "../middleware/uploadFile.js";

const router = express.Router();

router.post('/', verifyToken, uploadFile.single("file"), filesPost);
router.get('/:id', verifyToken, filesGet);

export default router;
