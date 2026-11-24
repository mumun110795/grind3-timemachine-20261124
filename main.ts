// Funniest Time Machine Warning Label — entry writer.
// Holds the label, checks it against the gate, and stamps it to entry.txt.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The label itself. One line, printed (metaphorically) in raised red
// lettering on the side of the machine, right next to the big lever.
const LABEL =
  "WARNING: Do not meet your past self. Manufacturer is not liable for paradoxes, duplicates, or child support.";

// The gate: entry.txt must hold between these many characters.
const SHORTEST_ALLOWED = 1;
const LONGEST_ALLOWED = 120;

function checkLabel(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("label must fit on a single line");
  }
  const size = [...text].length;
  if (size < SHORTEST_ALLOWED || size > LONGEST_ALLOWED) {
    throw new Error(
      `label is ${size} characters; the gate wants ${SHORTEST_ALLOWED}-${LONGEST_ALLOWED}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("label must not be blank");
  }
}

function resolveOutDir(): string {
  const fromEnv = process.env.OUTPUT_DIR;
  return fromEnv && fromEnv.trim() !== "" ? fromEnv : "/output";
}

function main(): void {
  checkLabel(LABEL);

  const outDir = resolveOutDir();
  // Create the directory if needed. Never remove it: on the grading
  // runner it can be a mounted volume, and deleting a mount point fails.
  mkdirSync(outDir, { recursive: true });

  const target = join(outDir, "entry.txt");
  writeFileSync(target, LABEL, { encoding: "utf8" });

  // Read the file back and verify it matches the intended label exactly.
  // A short or altered write would otherwise ship silently.
  const written = readFileSync(target, { encoding: "utf8" });
  if (written !== LABEL) {
    throw new Error(
      `entry.txt verification failed: file contents do not match the intended label`,
    );
  }

  console.log(`wrote ${target} (${[...LABEL].length} characters)`);
}

main();
