export const EASY_BATCH_SIZE = 4;
export const MEDIUM_BATCH_SIZE = 2;
export const HARD_BATCH_SIZE = 3;

export const chunkArray = (items = [], size = 1) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const safeSize = Math.max(1, Number(size) || 1);
  const chunks = [];
  for (let i = 0; i < items.length; i += safeSize) {
    chunks.push(items.slice(i, i + safeSize));
  }
  return chunks;
};

export const getBatchSizeByDifficulty = (difficulty = "") => {
  const normalized = String(difficulty).toLowerCase();
  if (normalized === "easy") return EASY_BATCH_SIZE;
  if (normalized === "medium") return MEDIUM_BATCH_SIZE;
  if (normalized === "hard") return HARD_BATCH_SIZE;
  return HARD_BATCH_SIZE;
};

export const buildQuestionBatches = (questions = []) => {
  const grouped = new Map();

  for (const question of questions) {
    const topicId = String(question?.topicId || "");
    const difficulty = String(question?.difficulty || "").toLowerCase();
    if (!topicId || !difficulty) continue;

    const key = `${topicId}::${difficulty}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        topicId,
        difficulty,
        questions: [],
      });
    }
    grouped.get(key).questions.push(question);
  }

  const batches = [];
  for (const group of grouped.values()) {
    const chunks = chunkArray(
      group.questions,
      getBatchSizeByDifficulty(group.difficulty)
    );
    for (const chunk of chunks) {
      if (chunk.length === 0) continue;
      batches.push({
        topicId: group.topicId,
        difficulty: group.difficulty,
        questions: chunk,
      });
    }
  }

  return batches;
};

export const buildK2UserPayload = ({ batch, topic }) => {
  const topicMeta = {
    topicId: batch?.topicId || "",
    title: topic?.title || "",
    description: topic?.description || "",
    difficulty: batch?.difficulty || "",
  };

  const questions = (Array.isArray(batch?.questions) ? batch.questions : []).map((q) => ({
    questionId: q?.questionId || "",
    topicId: q?.topicId || "",
    difficulty: q?.difficulty || "",
    questionType: q?.questionType || "",
    points: q?.points ?? null,
    sampleQuestion: q?.questionSample || "",
    sampleQuestionSolution: q?.questionSampleSolution || "",
  }));

  return {
    topic: topicMeta,
    questions,
  };
};

const normalizeOption = (option) => {
  if (!option || typeof option !== "object") return null;
  const key = String(option?.key || "").trim();
  const text = String(option?.text || "").trim();
  if (!key || !text) return null;
  return { key, text };
};

const normalizeMatchingPairs = (value) => {
  if (!value || typeof value !== "object") return null;
  const left = Array.isArray(value.left)
    ? value.left.map((x) => String(x || "").trim()).filter(Boolean)
    : [];
  const right = Array.isArray(value.right)
    ? value.right.map((x) => String(x || "").trim()).filter(Boolean)
    : [];
  const correctMapping = Array.isArray(value.correctMapping)
    ? value.correctMapping
        .map((pair) => ({
          left: String(pair?.left || "").trim(),
          right: String(pair?.right || "").trim(),
        }))
        .filter((pair) => pair.left && pair.right)
    : [];

  if (left.length === 0 || right.length === 0 || correctMapping.length === 0) return null;
  return { left, right, correctMapping };
};

const validateByQuestionType = (item, inputQuestion) => {
  const questionType = String(item?.questionType || "");
  const expectedType = String(inputQuestion?.questionType || "");
  if (questionType !== expectedType) {
    return { ok: false, error: "questionType mismatch" };
  }

  const questionText = String(item?.question || "").trim();
  if (!questionText) {
    return { ok: false, error: "question text is required" };
  }

  const answerText = typeof item?.answer === "string" ? item.answer.trim() : "";
  const options = Array.isArray(item?.options)
    ? item.options.map(normalizeOption).filter(Boolean)
    : [];
  const matchingPairs = normalizeMatchingPairs(item?.matchingPairs);

  if (questionType === "Multiple choice") {
    if (options.length !== 4) return { ok: false, error: "Multiple choice needs exactly 4 options" };
    if (!answerText) return { ok: false, error: "Multiple choice needs answer key" };
    const optionKeys = new Set(options.map((option) => option.key));
    if (!optionKeys.has(answerText)) {
      return { ok: false, error: "Multiple choice answer must match one option key" };
    }
    return {
      ok: true,
      value: {
        question: questionText,
        answer: answerText,
        options,
        matchingPairs: null,
      },
    };
  }

  if (questionType === "Matching") {
    if (!matchingPairs) return { ok: false, error: "Matching requires matchingPairs" };
    return {
      ok: true,
      value: {
        question: questionText,
        answer: answerText,
        options: [],
        matchingPairs,
      },
    };
  }

  if (questionType === "True/False") {
    if (!(answerText === "True" || answerText === "False")) {
      return { ok: false, error: "True/False answer must be True or False" };
    }
    return {
      ok: true,
      value: {
        question: questionText,
        answer: answerText,
        options: [],
        matchingPairs: null,
      },
    };
  }

  if (
    questionType === "Short answer" ||
    questionType === "Numeric answer" ||
    questionType === "Proof/Derivation"
  ) {
    return {
      ok: true,
      value: {
        question: questionText,
        answer: answerText,
        options: [],
        matchingPairs: null,
      },
    };
  }

  return { ok: false, error: "Unsupported questionType" };
};

export const parseGeneratedQuestions = (rawContent, batchQuestions = []) => {
  if (typeof rawContent !== "string" || !rawContent.trim()) {
    return { ok: false, error: "Empty model output", map: new Map() };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(rawContent);
  } catch (_) {
    return { ok: false, error: "Model output is not valid JSON", map: new Map() };
  }

  if (!Array.isArray(parsed?.generatedQuestions)) {
    return { ok: false, error: "generatedQuestions array is required", map: new Map() };
  }

  if (parsed.generatedQuestions.length !== batchQuestions.length) {
    return { ok: false, error: "generatedQuestions count mismatch", map: new Map() };
  }

  const map = new Map();

  for (let i = 0; i < batchQuestions.length; i += 1) {
    const inputQuestion = batchQuestions[i];
    const outputQuestion = parsed.generatedQuestions[i];

    const expectedId = String(inputQuestion?.questionId || "");
    const outputId = String(outputQuestion?.questionId || "");
    if (!expectedId || expectedId !== outputId) {
      return {
        ok: false,
        error: `questionId mismatch at index ${i}`,
        map: new Map(),
      };
    }

    if (
      String(outputQuestion?.difficulty || "").toLowerCase() !==
      String(inputQuestion?.difficulty || "").toLowerCase()
    ) {
      return {
        ok: false,
        error: `difficulty mismatch for ${expectedId}`,
        map: new Map(),
      };
    }

    const validated = validateByQuestionType(outputQuestion, inputQuestion);
    if (!validated.ok) {
      return {
        ok: false,
        error: `${validated.error} (${expectedId})`,
        map: new Map(),
      };
    }

    map.set(expectedId, validated.value);
  }

  return { ok: true, error: "", map };
};
