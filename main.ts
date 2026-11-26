import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Gate from competition.yaml: /output/entry.txt must be UTF-8 text of
// 1 to 160 characters, not only whitespace, exactly one line.
const MIN_CHARS = 1;
const MAX_CHARS = 160;

const ENTRY =
  "Blorvenholm: highs of 41°, with a light shower of small, apologetic frogs until noon, clearing to a 90% chance of mild regret by evening.";

function validateEntry(text: string): void {
  const chars = [...text];
  if (chars.length < MIN_CHARS || chars.length > MAX_CHARS) {
    throw new Error(
      `entry is ${chars.length} characters, must be ${MIN_CHARS}-${MAX_CHARS}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

validateEntry(ENTRY);
mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", ENTRY, "utf8");

// Byte-level read-back: what the grader will read must be exactly ENTRY.
const readBack = readFileSync("/output/entry.txt");
if (!readBack.equals(Buffer.from(ENTRY, "utf8"))) {
  throw new Error("read-back mismatch: /output/entry.txt != ENTRY");
}
console.log(`Wrote ${[...ENTRY].length} characters to /output/entry.txt`);
