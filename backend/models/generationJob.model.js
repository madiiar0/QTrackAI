import mongoose from "mongoose";

const generationJobSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true },
    promptId: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    progress: { type: Number, default: 0 },
    currentStep: { type: String, default: "queued" },
    error: { type: String, default: null },
    resultFileId: { type: String, default: null },
  },
  { timestamps: true }
);

const GenerationJobModel = mongoose.model("GenerationJobModel", generationJobSchema);

export default GenerationJobModel;
