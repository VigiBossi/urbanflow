/** Tag for Java source: keeps backslashes literal and trims the surrounding blank lines. */
export const java = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw({ raw: s.raw }, ...v)
    .replace(/^\n/, "")
    .replace(/\s+$/, "");

/** Join markdown lines. */
export const md = (...lines: string[]) => lines.join("\n");
