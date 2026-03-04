import PromptModel from "../models/prompt.model.js";

export const promptPost = async (req, res) => {
    try{
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const payload = req.body || {};
        if (payload.ownerId && String(payload.ownerId) !== String(userId)) {
            return res.status(400).json({ success: false, message: "ownerId mismatch" });
        }

        const { ownerId, ...rest } = payload;

        const doc = await PromptModel.findOneAndUpdate(
            { ownerId: String(userId) },
            { $set: rest, $setOnInsert: { ownerId: String(userId) } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        ).lean();

        return res.status(201).json({
            success: true,
            message: "Prompt saved",
            prompt: doc
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const promptGet = async (req, res) => {
    try{
        const userId = req.userId;
        if(!userId){
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const doc = await PromptModel.findOne({ ownerId: String(userId) }).lean();
        if(!doc){
            return res.status(404).json({ success: false, message: "Prompt not found" });
        }

        return res.status(200).json({
            success: true,
            prompt: doc
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}
