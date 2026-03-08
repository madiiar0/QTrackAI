import GenerationJobModel from "../models/generationJob.model.js";
import PromptModel from "../models/prompt.model.js";
import FileModel from "../models/files.model.js";
import fsp from "fs/promises";
import {
  SAMPLE_MODEL,
  SAMPLE_SYSTEM_PROMPT,
  SAMPLE_USER_PROMPT,
} from "../samples/openaiPrompts.js";

const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const updateGenerationJobStatus = async (jobId, payload = {}) => {
  await GenerationJobModel.findByIdAndUpdate(
    jobId,
    { $set: payload },
    { new: true }
  );
};

const sampleFromDocuments = async (jobId) => {
  const job = await GenerationJobModel.findById(jobId).lean();
  if (!job?.promptId || !job?.ownerId) return;

  const prompt = await PromptModel.findOne({
    _id: String(job.promptId),
    ownerId: String(job.ownerId),
  });
  if (!prompt) return;

  const topics = Array.isArray(prompt.topics) ? prompt.topics : [];
  const questions = Array.isArray(prompt.questions) ? prompt.questions : [];
  const openAiApiKey = process.env.OPENAI_API_KEY;

  const readOpenAiJson = (payload) => {
    if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
      try {
        return JSON.parse(payload.output_text);
      } catch (_) {}
    }

    const textParts = [];
    const outputBlocks = Array.isArray(payload?.output) ? payload.output : [];
    for (const block of outputBlocks) {
      const content = Array.isArray(block?.content) ? block.content : [];
      for (const item of content) {
        if (typeof item?.text === "string" && item.text.trim()) {
          textParts.push(item.text);
        }
      }
    }

    if (textParts.length === 0) return null;

    try {
      return JSON.parse(textParts.join("\n"));
    } catch (_) {
      return null;
    }
  };

  const sanitizeBucket = (bucket) => {
    if (!bucket || typeof bucket !== "object") return null;

    return {
      sampleQuestion:
        typeof bucket.sampleQuestion === "string" ? bucket.sampleQuestion.trim() : "",
      sampleQuestionSolution:
        typeof bucket.sampleQuestionSolution === "string"
          ? bucket.sampleQuestionSolution.trim()
          : "",
      source: typeof bucket.source === "string" ? bucket.source.trim() : "",
    };
  };

  for (const topic of topics) {
    let easyBucket = null;
    let mediumBucket = null;
    let hardBucket = null;

    const materialIds = (Array.isArray(topic?.materials) ? topic.materials : []).filter(Boolean);
    const hasMaterials = materialIds.length > 0;

    if (hasMaterials && openAiApiKey) {
      try {
        const fileDocs = await FileModel.find({
          ownerId: String(job.ownerId),
          publicId: { $in: materialIds },
        }).lean();

        const docsById = new Map(fileDocs.map((doc) => [doc.publicId, doc]));
        const attachedFiles = [];

        for (const publicId of materialIds) {
          const fileDoc = docsById.get(publicId);
          if (!fileDoc?.storedPath) continue;

          try {
            const fileBuffer = await fsp.readFile(fileDoc.storedPath);
            attachedFiles.push({
              type: "input_file",
              filename: fileDoc.originalName || `${publicId}.pdf`,
              file_data: `data:${fileDoc.mimeType || "application/pdf"};base64,${fileBuffer.toString("base64")}`,
            });
          } catch (error) {
            console.error("Failed to read topic material", {
              publicId,
              message: error?.message,
            });
          }
        }

        if (attachedFiles.length > 0) {
          const userPrompt = SAMPLE_USER_PROMPT
              .replace("{{TOPIC TITLE}}", topic?.title || "Untitled topic")
              .replace("{{DESCRIPTION TITLE}}", topic?.description || "");

          const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openAiApiKey}`,
            },
            body: JSON.stringify({
              model: SAMPLE_MODEL,
              input: [
                {
                  role: "system",
                  content: [
                    {
                      type: "input_text",
                      text: SAMPLE_SYSTEM_PROMPT,
                    },
                  ],
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "input_text",
                      text: `${userPrompt}`,
                    },
                    ...attachedFiles,
                  ],
                },
              ],
              text: {
                format: {
                  type: "json_schema",
                  name: "topic_samples",
                  strict: false,
                  schema: {
                    type: "object",
                    properties: {
                      easy: { type: ["object", "null"] },
                      medium: { type: ["object", "null"] },
                      hard: { type: ["object", "null"] },
                    },
                    additionalProperties: true,
                  },
                },
              },
            }),
          });

          if (response.ok) {
            const payload = await response.json();
            const parsed = readOpenAiJson(payload);
            easyBucket = sanitizeBucket(parsed?.easy);
            mediumBucket = sanitizeBucket(parsed?.medium);
            hardBucket = sanitizeBucket(parsed?.hard);
          } else {
            const responseText = await response.text();
            console.error("OpenAI sample request failed", {
              topicId: topic?.topicId,
              status: response.status,
              body: responseText,
            });
          }
        }
      } catch (error) {
        console.error("OpenAI sample parsing failed", {
          topicId: topic?.topicId,
          message: error?.message,
        });
      }
    }

    topic.easySampleQuestion = easyBucket?.sampleQuestion || "";
    topic.easySampleQuestionSolution = easyBucket?.sampleQuestionSolution || "";
    topic.easySampleQuestionSource = easyBucket?.source || "";
    topic.mediumSampleQuestion = mediumBucket?.sampleQuestion || "";
    topic.mediumSampleQuestionSolution = mediumBucket?.sampleQuestionSolution || "";
    topic.mediumSampleQuestionSource = mediumBucket?.source || "";
    topic.hardSampleQuestion = hardBucket?.sampleQuestion || "";
    topic.hardSampleQuestionSolution = hardBucket?.sampleQuestionSolution || "";
    topic.hardSampleQuestionSource = hardBucket?.source || "";

    for (const question of questions) {
      if (String(question?.topicId || "") !== String(topic?.topicId || "")) continue;

      const difficulty = String(question?.difficulty || "").toLowerCase();
      if (difficulty === "easy") {
        question.questionSample = easyBucket?.sampleQuestion || "";
        question.questionSampleSolution = easyBucket?.sampleQuestionSolution || "";
      } else if (difficulty === "medium") {
        question.questionSample = mediumBucket?.sampleQuestion || "";
        question.questionSampleSolution = mediumBucket?.sampleQuestionSolution || "";
      } else if (difficulty === "hard") {
        question.questionSample = hardBucket?.sampleQuestion || "";
        question.questionSampleSolution = hardBucket?.sampleQuestionSolution || "";
      } else {
        question.questionSample = "";
        question.questionSampleSolution = "";
      }
    }
  }

  prompt.markModified("topics");
  prompt.markModified("questions");
  await prompt.save();
};

const generateExamWithAI = async () => {
  await sleep();
};

const saveGeneratedExamFile = async () => {
  await sleep();
};

const runGenerationPipeline = async (jobId) => {
  try {
    await updateGenerationJobStatus(jobId, {
      status: "running",
      progress: 10,
      currentStep: "sampleFromDocuments",
      error: null,
    });
    await sampleFromDocuments(jobId);

    await updateGenerationJobStatus(jobId, {
      progress: 50,
      currentStep: "generateExamWithAI",
    });
    await generateExamWithAI();

    await updateGenerationJobStatus(jobId, {
      progress: 90,
      currentStep: "saveGeneratedExamFile",
    });
    await saveGeneratedExamFile();

    await updateGenerationJobStatus(jobId, {
      status: "completed",
      progress: 100,
      currentStep: "completed",
      error: null,
    });
  } catch (error) {
    await updateGenerationJobStatus(jobId, {
      status: "failed",
      currentStep: "failed",
      error: error?.message || "Generation failed",
    });
    throw error;
  }
};

export const generateExam = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const prompt = await PromptModel.findOne({ ownerId: String(userId) }).lean();
    if (!prompt) {
      return res.status(404).json({ success: false, message: "Prompt not found" });
    }

    const job = await GenerationJobModel.create({
      ownerId: String(userId),
      promptId: String(prompt._id),
      status: "queued",
      progress: 0,
      currentStep: "queued",
      error: null,
    });

    runGenerationPipeline(job._id).catch((error) => {
      console.error("Generation pipeline error:", error);
    });

    return res.status(201).json({
      success: true,
      message: "Generation started",
      jobId: String(job._id),
      status: job.status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to start generation",
    });
  }
};

export const generateStatusGet = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required" });
    }

    const job = await GenerationJobModel.findOne({
      _id: String(jobId),
      ownerId: String(userId),
    }).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Generation job not found" });
    }

    return res.status(200).json({
      success: true,
      job: {
        jobId: String(job._id),
        ownerId: job.ownerId,
        promptId: job.promptId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
