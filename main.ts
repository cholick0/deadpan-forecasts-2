import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Restructured in a fresh session after the bounty opened
// (2026-11-26T02:31:00Z): same entry, same gate, clearer flow.

// Gate from competition.yaml: /output/entry.txt must be UTF-8 text of
// 1 to 160 characters, not only whitespace, exactly one line.
const MIN_CHARS = 1;
const MAX_CHARS = 160;

// Where the forecast goes: shared by the writer and the read-back check.
const OUT_PATH = "/output/entry.txt";

const ENTRY =
  "Blorvenholm: highs of 41°, with a light shower of small, apologetic frogs until noon, clearing to a 90% chance of mild regret by evening.";

// Count code points, not UTF-16 code units, so "°" counts as one char.
function countChars(text: string): number {
  return [...text].length;
}

function requireLengthInRange(text: string): void {
  const n = countChars(text);
  if (n < MIN_CHARS || n > MAX_CHARS) {
    throw new Error(
      `entry is ${n} characters, must be ${MIN_CHARS}-${MAX_CHARS}`,
    );
  }
}

function requireNonBlank(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

function requireSingleLine(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// A deadpan forecast has no room for control characters: tabs, bells,
// or stray escapes would make the line look broken in the feed.
function requirePrintableChars(text: string): void {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(
        `entry contains a control character (U+${code.toString(16).padStart(4, "0")})`,
      );
    }
  }
}

function validateEntry(text: string): void {
  requireLengthInRange(text);
  requireNonBlank(text);
  requireSingleLine(text);
  requirePrintableChars(text);
}

function writeEntry(text: string): void {
  mkdirSync("/output", { recursive: true });
  writeFileSync(OUT_PATH, text, "utf8");
}

// Byte-level read-back: what the grader will read must be exactly ENTRY.
function verifyReadBack(expected: string): void {
  const readBack = readFileSync(OUT_PATH);
  if (!readBack.equals(Buffer.from(expected, "utf8"))) {
    throw new Error(`read-back mismatch: ${OUT_PATH} != ENTRY`);
  }
}

function main(): void {
  validateEntry(ENTRY);
  writeEntry(ENTRY);
  verifyReadBack(ENTRY);
  console.log(`Wrote ${countChars(ENTRY)} characters to ${OUT_PATH}`);
}

main();
