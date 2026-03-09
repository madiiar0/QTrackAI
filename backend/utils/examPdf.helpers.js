const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN_X = 48;
const START_Y = 790;
const FONT_SIZE = 12;
const LINE_HEIGHT = 16;
const MAX_CHARS_PER_LINE = 95;
const MAX_LINES_PER_PAGE = Math.floor((START_Y - 52) / LINE_HEIGHT);

const latexToReadable = (input = "") => {
  if (typeof input !== "string" || !input) return "";

  let text = input;

  const inlineMathRegex = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$|\$([\s\S]*?)\$/g;
  text = text.replace(inlineMathRegex, (_, a, b, c, d) => {
    const expr = a || b || c || d || "";
    return expr
      .replace(/\\frac\s*{([^}]*)}\s*{([^}]*)}/g, "($1)/($2)")
      .replace(/\\sqrt\s*{([^}]*)}/g, "sqrt($1)")
      .replace(/\\leq/g, "<=")
      .replace(/\\geq/g, ">=")
      .replace(/\\times/g, "x")
      .replace(/\\cdot/g, "*")
      .replace(/\\pm/g, "+/-")
      .replace(/\\neq/g, "!=")
      .replace(/\\to/g, "->")
      .replace(/\\infty/g, "infinity")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/[{}]/g, "")
      .trim();
  });

  return text;
};

const sanitizeText = (value = "") =>
  latexToReadable(String(value || ""))
    .replace(/\s+/g, " ")
    .trim();

const wrapText = (text = "", maxChars = MAX_CHARS_PER_LINE) => {
  const clean = sanitizeText(text);
  if (!clean) return [""];

  const words = clean.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
};

const buildExamLines = (prompt) => {
  const lines = [];
  const title = sanitizeText(prompt?.exam?.title || "Generated Exam");
  lines.push(title || "Generated Exam");
  lines.push("");

  const topics = Array.isArray(prompt?.topics) ? prompt.topics : [];
  const topicById = new Map(topics.map((topic) => [String(topic?.topicId || ""), topic]));
  const questions = Array.isArray(prompt?.questions) ? prompt.questions : [];

  let currentTopicId = "";
  let index = 1;

  for (const question of questions) {
    const topicId = String(question?.topicId || "");
    const topic = topicById.get(topicId);

    if (topicId && topicId !== currentTopicId) {
      currentTopicId = topicId;
      lines.push("");
      lines.push(`Topic: ${sanitizeText(topic?.title || "Untitled topic")}`);
      if (sanitizeText(topic?.description || "")) {
        lines.push(`Description: ${sanitizeText(topic?.description || "")}`);
      }
      lines.push("");
    }

    const generated = question?.newQuestion || {};
    const questionText = sanitizeText(generated?.question || "");
    const baseHeader = `${index}. ${questionText || "[Question text missing]"}`;
    lines.push(...wrapText(baseHeader));

    const options = Array.isArray(generated?.options) ? generated.options : [];
    if (options.length > 0) {
      for (const option of options) {
        const optionLine = `${sanitizeText(option?.key || "")}) ${sanitizeText(option?.text || "")}`;
        lines.push(...wrapText(optionLine));
      }
    }

    const matchingPairs = generated?.matchingPairs || {};
    const left = Array.isArray(matchingPairs?.left) ? matchingPairs.left : [];
    const right = Array.isArray(matchingPairs?.right) ? matchingPairs.right : [];
    if (left.length > 0 || right.length > 0) {
      lines.push(...wrapText("Match the following:"));
      const pairLen = Math.max(left.length, right.length);
      for (let i = 0; i < pairLen; i += 1) {
        const leftText = sanitizeText(left[i] || "");
        const rightText = sanitizeText(right[i] || "");
        lines.push(...wrapText(`  ${i + 1}) ${leftText}    |    ${String.fromCharCode(65 + i)}) ${rightText}`));
      }
    }

    lines.push("");
    index += 1;
  }

  return lines;
};

const paginateLines = (lines = []) => {
  const pages = [];
  for (let i = 0; i < lines.length; i += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + MAX_LINES_PER_PAGE));
  }
  return pages.length > 0 ? pages : [["Generated exam is empty."]];
};

const escapePdfText = (value = "") =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

export const buildExamPdfBuffer = (prompt) => {
  const lines = buildExamLines(prompt);
  const pagesLines = paginateLines(lines);

  const objects = [null];
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = ""; // pages placeholder
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  const pageIds = [];
  for (const pageLines of pagesLines) {
    const contentParts = [];
    contentParts.push("BT");
    contentParts.push(`/F1 ${FONT_SIZE} Tf`);
    contentParts.push(`${PAGE_MARGIN_X} ${START_Y} Td`);
    contentParts.push(`${LINE_HEIGHT} TL`);

    pageLines.forEach((line, idx) => {
      if (idx === 0) {
        contentParts.push(`(${escapePdfText(line)}) Tj`);
      } else {
        contentParts.push("T*");
        contentParts.push(`(${escapePdfText(line)}) Tj`);
      }
    });

    contentParts.push("ET");
    const contentStream = contentParts.join("\n");

    const contentId = objects.length;
    objects[contentId] = `<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream`;

    const pageId = objects.length;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    pageIds.push(pageId);
  }

  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, "utf8");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
};

