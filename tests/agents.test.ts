/**
 * Custom Agents Tests
 * 
 * Tests to verify that custom agent markdown files are properly formatted.
 */

import { describe, test, expect } from "bun:test";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

describe("Custom Agents Markdown Files", () => {
  const agentsDir = join(process.cwd(), ".opencode/agent");

  test("agents directory should exist and contain markdown files", async () => {
    const files = await readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    
    expect(mdFiles.length).toBeGreaterThan(0);
  });

  test("agent files should have valid YAML frontmatter", async () => {
    const files = await readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const content = await readFile(join(agentsDir, file), "utf-8");
      
      // Check for frontmatter delimiters
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/\n---\n/);
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
      expect(frontmatterMatch).toBeTruthy();
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        
        // Check for required fields
        expect(frontmatter).toMatch(/name:/);
        expect(frontmatter).toMatch(/description:/);
        expect(frontmatter).toMatch(/mode:/);
      }
    }
  });

  test("agent names should follow naming convention (kebab-case)", async () => {
    const files = await readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md") && f !== "template.md");

    for (const file of mdFiles) {
      const fileName = file.replace(".md", "");
      // Should be kebab-case (lowercase with hyphens)
      expect(fileName).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});
