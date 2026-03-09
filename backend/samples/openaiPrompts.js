export const SAMPLE_MODEL = "gpt-4.1-mini";

export const SAMPLE_SYSTEM_PROMPT =
  "You are helping build an exam-generation pipeline.\n" +
    "\n" +
    "You are given materials for exactly one topic.\n" +
    "\n" +
    "Your job is to identify representative questions from the provided materials and return:\n" +
    "- one easy solved question\n" +
    "- one medium solved question\n" +
    "- one hard solved question\n" +
    "\n" +
    "Core rules:\n" +
    "- Prefer extracting existing questions from the materials.\n" +
    "- If an extracted question does not include a full solution, solve it yourself.\n" +
    "- Do not generate brand new questions unless you are reconstructing an incomplete extracted question with high confidence.\n" +
    "- If there is no suitable question for a difficulty, return null for that difficulty.\n" +
    "- Work only from the provided topic and materials.\n" +
    "- Do not claim a question came from the materials if it did not.\n" +
    "- Prefer questions that are self-contained, clearly written, representative of the topic, and reusable as examples.\n" +
    "- Avoid choosing near-duplicate questions across easy, medium, and hard if possible.\n" +
    "\n" +
    "Difficulty rubric:\n" +
    "- easy = straightforward, direct concept use, short solution\n" +
    "- medium = moderate reasoning, several steps\n" +
    "- hard = deeper reasoning, less routine, multi-step or tricky\n" +
    "\n" +
    "Source rules:\n" +
    "- If full solution is present in the materials, use \"extracted_with_solution\"\n" +
    "- If the question is present but the solution is missing/incomplete and you solve it, use \"extracted_and_solved\"\n" +
    "\n" +
    "Output rules:\n" +
    "- Return valid JSON only.\n" +
    "- Do not wrap the JSON in markdown fences.\n" +
    "- Do not output any prose before or after the JSON.\n" +
    "- If a level is missing, set it to null.\n" +
    "- Every non-null difficulty object must contain non-empty sampleQuestion, sampleQuestionSolution, and source.\n" +
    "- Return JSON that is directly parseable by JSON.parse().";

export const SAMPLE_USER_PROMPT =
  "Analyze the following topic materials and return one representative solved question for each difficulty level.\n" +
    "\n" +
    "Topic:\n" +
    "\n" +
    "title: {{TOPIC TITLE}}\n" +
    "description: {{DESCRIPTION TITLE}}\n" +
    "Return JSON in exactly this schema:\n" +
    "{\n" +
    "\"easy\": {\n" +
    "\"sampleQuestion\": \"string\",\n" +
    "\"sampleQuestionSolution\": \"string\",\n" +
    "\"source\": \"extracted_with_solution\"\n" +
    "},\n" +
    "\"medium\": {\n" +
    "\"sampleQuestion\": \"string\",\n" +
    "\"sampleQuestionSolution\": \"string\",\n" +
    "\"source\": \"extracted_with_solution\"\n" +
    "},\n" +
    "\"hard\": {\n" +
    "\"sampleQuestion\": \"string\",\n" +
    "\"sampleQuestionSolution\": \"string\",\n" +
    "\"source\": \"extracted_with_solution\"\n" +
    "}\n" +
    "}\n" +
    "\n" +
    "Important:\n" +
    "\n" +
    "If source is not extracted_with_solution, use extracted_and_solved.\n" +
    "If no suitable question exists for a difficulty, set that field to null.\n" +
    "Use the provided materials as the basis for extraction.\n" +
    "If a question is found but no complete solution is provided, solve it.";

export const GENERATE_EXAM_SYSTEM_PROMPT =
  "You generate exam questions in strict JSON format for multiple items in one batch.\n" +
    "Return JSON only (no markdown fences, no commentary).\n" +
    "Generate exactly one question for each input item.\n" +
    "Preserve input order exactly.\n" +
    "Preserve questionId exactly as provided.\n" +
    "Every generated item must match requested topicId, difficulty, questionType, and points intent.\n" +
    "Use sampleQuestion and sampleQuestionSolution as style/reasoning cues.\n" +
    "Schema:\n" +
    "{\n" +
    "  \"generatedQuestions\": [\n" +
    "    {\n" +
    "      \"questionId\": \"string\",\n" +
    "      \"topicId\": \"string\",\n" +
    "      \"difficulty\": \"easy|medium|hard\",\n" +
    "      \"questionType\": \"Multiple choice|Short answer|Numeric answer|Proof/Derivation|Matching|True/False\",\n" +
    "      \"points\": 1,\n" +
    "      \"question\": \"string\",\n" +
    "      \"answer\": \"string\",\n" +
    "      \"options\": [{\"key\":\"A\",\"text\":\"...\"}],\n" +
    "      \"matchingPairs\": {\n" +
    "        \"left\": [\"...\"],\n" +
    "        \"right\": [\"...\"],\n" +
    "        \"correctMapping\": [{\"left\":\"...\",\"right\":\"...\"}]\n" +
    "      }\n" +
    "    }\n" +
    "  ]\n" +
    "}\n" +
    "Rules by type:\n" +
    "- Multiple choice: exactly 4 options and exactly one correct answer key in \"answer\".\n" +
    "- Matching: matchingPairs is required; options must be empty.\n" +
    "- True/False: answer must be exactly \"True\" or \"False\".\n" +
    "- Short answer / Numeric answer / Proof/Derivation: options and matchingPairs must be empty.";

export const GENERATE_EXAM_USER_PROMPT =
  "Generate exam questions for this batch using the input JSON that follows.\n" +
    "Important:\n" +
    "- Output must be valid JSON only.\n" +
    "- Output array key must be \"generatedQuestions\".\n" +
    "- Output count must exactly match input questions count.\n" +
    "- Keep output order exactly same as input order.\n" +
    "- Keep each questionId exactly same as input.\n" +
    "- Match each input questionType exactly.\n" +
    "- Use clear, exam-ready wording.\n" +
    "The next block is the batch payload as one-line JSON.";
