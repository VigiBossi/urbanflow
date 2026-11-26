// Tiny, dependency-free Java tokenizer for syntax highlighting.

export type TokenType = "comment" | "string" | "char" | "number" | "keyword" | "type" | "literal" | "fn" | "annotation" | "plain";
export interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set(
  "abstract assert break case catch class continue default do else enum extends final finally for if implements import instanceof interface native new package private protected public return static super switch synchronized this throw throws try void volatile while var".split(
    " ",
  ),
);
const TYPES = new Set("int double float long short byte char boolean String Scanner System Math Integer Double Character Object".split(" "));
const LITERALS = new Set(["true", "false", "null"]);

const RE =
  /(\/\*[\s\S]*?(?:\*\/|$))|(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"?)|('(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?[dDfFlL]?\b)|(@\w+)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"'\/]+|\/)/g;

export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(code))) {
    const text = m[0];
    if (m[1] || m[2]) out.push({ type: "comment", text });
    else if (m[3]) out.push({ type: "string", text });
    else if (m[4]) out.push({ type: "char", text });
    else if (m[5]) out.push({ type: "number", text });
    else if (m[6]) out.push({ type: "annotation", text });
    else if (m[7]) {
      if (KEYWORDS.has(text)) out.push({ type: "keyword", text });
      else if (LITERALS.has(text)) out.push({ type: "literal", text });
      else if (TYPES.has(text) || /^[A-Z]/.test(text)) out.push({ type: "type", text });
      else if (/^\s*\(/.test(code.slice(RE.lastIndex))) out.push({ type: "fn", text });
      else out.push({ type: "plain", text });
    } else out.push({ type: "plain", text });
    if (text.length === 0) RE.lastIndex++;
  }
  return out;
}

/** Tokens split into lines (multi-line comments are split across lines). */
export function tokenizeLines(code: string): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokenize(code)) {
    const parts = t.text.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ type: t.type, text: p });
    });
  }
  return lines;
}
