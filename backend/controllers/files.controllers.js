import fs from "fs";
import fsp from "fs/promises";
import FileModel from "../models/files.model.js";
import { saveFileMetadata } from "../services/files.service.js";

export const filesPost = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: "File must be provided!" });
        }

        const doc = await saveFileMetadata({
            ownerId: userId,
            storedPath: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size
        });

        return res.status(201).json({
            success: true,
            fileId: doc.publicId,
            meta: {
                originalName: doc.originalName,
                sizeBytes: doc.sizeBytes,
                mimeType: doc.mimeType
            }
        });
    } catch (err) {
        // cleanup orphan file if it exists
        if (req?.file?.path) {
            try { await fsp.unlink(req.file.path); } catch (_) {}
        }

        return res.status(500).json({
            success: false,
            message: "Failed to save file metadata",
            error: err.message
        });
    }
};

export const filesGet = async (req, res) => {
    const userId = req.userId;
    const publicId = req.params.id;

    if(!userId){
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const fileDoc = await FileModel.findOne({ publicId }).lean();
    if(!fileDoc) return res.status(404).json({ success: false, message: "File not found" });

    const filePath = fileDoc.storedPath;

    if(String(fileDoc.ownerId) !== userId) return res.status(403).json({ success: false, message: "Forbidden" });
    if(!filePath) return res.status(500).json({ success: false, message: "File path missing" });
    if(!fs.existsSync(filePath)) return res.status(410).json({ success: false, message: "File missing on server" });

    res.setHeader("Content-Type", "application/pdf");

    const safeName = (fileDoc.originalName || "document.pdf").replace(/[\r\n"]/g, "");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);

    const stream = fs.createReadStream(filePath);

    stream.on("error", (err) => {
        console.error("File stream error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to read file" });
        } else {
            res.end();
        }
    });

    stream.pipe(res);
}
