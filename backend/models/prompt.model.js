import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    title: String,
    audience: {type: String, enum: ["Early Elementary", "Middle School", "High School", "Foundation Year", "Undergraduate", "Graduate"], default: "High School"},
    totalQuestions: Number,
    totalScore: Number,
    outputFormat: {type: String, enum: ["pdf", "latex"], default: "pdf"},
    includeFullSolution: {type: Boolean, default: true},
})

const topicsSchema = new mongoose.Schema({
    topicId: {type: String, unique: true},
    title: {type: String},
    description: {type: String},
    materials: {type: [String, String]},
})

const questionsSchema = new mongoose.Schema({
    questionId: {type: String, unique: true},
    topicId: {type: String, unique: true},
    difficulty: {type: String, enum: ['easy', 'medium', 'hard']},
    questionType: {type: String, enum: ['Multiple choice', 'Short answer', 'Numeric answer', 'Proof/Derivation', 'Matching', 'True/False'], default: "Short answer"},
    points: Number,
})

const promptSchema = new mongoose.Schema({
    ownerId: {type: String},
    status: {type: String, enum: ["Not_started", "Completed", "Section_1", "Section_2", "Section_3", "Section_4", "Section_5"], default: "Not_started"},

    exam : examSchema,
    topics : {type: [topicsSchema], default: []},
    questions : {type: [questionsSchema], default: []},
})

const PromptModel = mongoose.model('PromptModel', promptSchema)

export default PromptModel;
