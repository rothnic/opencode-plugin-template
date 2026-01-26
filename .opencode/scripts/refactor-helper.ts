/**
 * Refactoring Helper Script
 * 
 * Utilities to assist with safe code refactoring.
 * Agents can discover and use this script via: @.opencode/scripts/refactor-helper.ts
 */

export interface ComplexityReport {
  file: string;
  functions: {
    name: string;
    lines: number;
    complexity: number;
    location: { line: number; column: number };
  }[];
  totalComplexity: number;
}

/**
 * Calculate cyclomatic complexity of a code block
 * Simple heuristic based on control flow keywords
 */
export function calculateComplexity(code: string): number {
  const keywords = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b&&\b/g,
    /\b\|\|\b/g,
    /\?\s*.*\s*:/g, // ternary
  ];

  let complexity = 1; // Base complexity
  for (const pattern of keywords) {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

/**
 * Find long functions in a TypeScript/JavaScript file
 */
export async function findLongFunctions(
  filePath: string,
  maxLines: number = 30
): Promise<{ name: string; lines: number; startLine: number }[]> {
  const fs = await import("fs/promises");
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const longFunctions: { name: string; lines: number; startLine: number }[] = [];
  let currentFunction: { name: string; startLine: number; braceDepth: number } | null = null;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Simple function detection (won't catch all cases, but good enough for heuristic)
    const functionMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\))?\s*(?:=>)?\s*\{/);

    if (functionMatch && !currentFunction) {
      currentFunction = {
        name: functionMatch[1],
        startLine: i + 1,
        braceDepth: 0,
      };
    }

    // Track brace depth
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    if (currentFunction) {
      currentFunction.braceDepth += openBraces - closeBraces;

      if (currentFunction.braceDepth <= 0) {
        const functionLength = i + 1 - currentFunction.startLine + 1;
        if (functionLength > maxLines) {
          longFunctions.push({
            name: currentFunction.name,
            lines: functionLength,
            startLine: currentFunction.startLine,
          });
        }
        currentFunction = null;
      }
    }

    braceDepth += openBraces - closeBraces;
  }

  return longFunctions;
}

/**
 * Find duplicated code blocks
 */
export async function findDuplication(
  filePath: string,
  minLines: number = 5
): Promise<{ code: string; occurrences: number[] }[]> {
  const fs = await import("fs/promises");
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const duplicates: Map<string, number[]> = new Map();

  // Look for duplicated sequences of lines
  for (let i = 0; i < lines.length - minLines; i++) {
    const block = lines.slice(i, i + minLines).join("\n").trim();

    if (block.length < 20) continue; // Skip very short blocks

    if (duplicates.has(block)) {
      duplicates.get(block)!.push(i + 1);
    } else {
      duplicates.set(block, [i + 1]);
    }
  }

  // Filter to only blocks that appear more than once
  const result: { code: string; occurrences: number[] }[] = [];
  for (const [code, occurrences] of duplicates.entries()) {
    if (occurrences.length > 1) {
      result.push({ code, occurrences });
    }
  }

  return result;
}

/**
 * Generate a refactoring report for a file
 */
export async function generateReport(filePath: string): Promise<string> {
  const longFunctions = await findLongFunctions(filePath);
  const duplicates = await findDuplication(filePath);

  let report = `# Refactoring Report: ${filePath}\n\n`;

  if (longFunctions.length > 0) {
    report += `## Long Functions (>30 lines)\n\n`;
    for (const func of longFunctions) {
      report += `- **${func.name}** (${func.lines} lines, starts at line ${func.startLine})\n`;
      report += `  Consider extracting smaller functions\n\n`;
    }
  }

  if (duplicates.length > 0) {
    report += `## Potential Code Duplication\n\n`;
    for (const dup of duplicates.slice(0, 5)) {
      // Show first 5
      report += `- Found ${dup.occurrences.length} occurrences at lines: ${dup.occurrences.join(", ")}\n`;
      report += `  Consider extracting to a shared function\n\n`;
    }
  }

  if (longFunctions.length === 0 && duplicates.length === 0) {
    report += `✅ No major refactoring opportunities detected.\n`;
  }

  return report;
}

/**
 * Suggest refactoring for a code snippet
 */
export function suggestRefactoring(code: string): {
  suggestions: string[];
  complexity: number;
} {
  const suggestions: string[] = [];
  const complexity = calculateComplexity(code);

  if (complexity > 10) {
    suggestions.push(
      "High complexity detected. Consider breaking into smaller functions."
    );
  }

  if (code.split("\n").length > 50) {
    suggestions.push("Long function detected. Extract logical sections into separate functions.");
  }

  const magicNumbers = code.match(/\b\d+\b/g);
  if (magicNumbers && magicNumbers.length > 3) {
    suggestions.push("Consider extracting magic numbers into named constants.");
  }

  if ((code.match(/if|else/g) || []).length > 5) {
    suggestions.push("Many conditional statements. Consider using a strategy pattern or lookup table.");
  }

  return { suggestions, complexity };
}

/**
 * Main function when run directly
 */
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: bun run .opencode/scripts/refactor-helper.ts <file-path>");
    process.exit(1);
  }

  const filePath = args[0];
  const report = await generateReport(filePath);
  console.log(report);
}
