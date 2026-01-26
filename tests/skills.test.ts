/**
 * Skills Configuration Tests
 * 
 * Tests to verify that skills are properly structured and can be used with OpenCode.
 * Skills provide reusable patterns and procedures for agents.
 */

import { describe, test, expect, beforeAll } from "bun:test";
import type { Skill } from "../.opencode/skills/example-skills";

describe("Skills Structure Tests", () => {
  let customSkills: any;

  beforeAll(async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    customSkills = skillsModule.customSkills;
  });

  test("customSkills should be exported", () => {
    expect(customSkills).toBeDefined();
    expect(typeof customSkills).toBe("object");
  });

  test("customSkills should contain skill definitions", () => {
    expect(Object.keys(customSkills).length).toBeGreaterThan(0);
  });

  test("each skill should have required fields", () => {
    for (const [skillKey, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      
      expect(s.name).toBeDefined();
      expect(typeof s.name).toBe("string");
      expect(s.name.length).toBeGreaterThan(0);
      
      expect(s.description).toBeDefined();
      expect(typeof s.description).toBe("string");
      expect(s.description.length).toBeGreaterThan(0);
      
      expect(s.tags).toBeDefined();
      expect(Array.isArray(s.tags)).toBe(true);
      
      expect(s.content).toBeDefined();
      expect(typeof s.content).toBe("string");
      expect(s.content.length).toBeGreaterThan(0);
    }
  });

  test("skill names should follow naming convention", () => {
    for (const [skillKey, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      // Skill names should be lowercase with hyphens
      expect(s.name).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  test("skills should have meaningful tags", () => {
    for (const [skillKey, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      
      expect(s.tags.length).toBeGreaterThan(0);
      
      s.tags.forEach(tag => {
        expect(typeof tag).toBe("string");
        expect(tag.length).toBeGreaterThan(0);
        // Tags should be lowercase
        expect(tag).toBe(tag.toLowerCase());
      });
    }
  });

  test("skill content should be substantial", () => {
    for (const [skillKey, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      
      // Content should be at least 100 characters
      expect(s.content.length).toBeGreaterThan(100);
    }
  });
});

describe("Skill Content Quality Tests", () => {
  let customSkills: any;

  beforeAll(async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    customSkills = skillsModule.customSkills;
  });

  test("skill content should contain structured information", () => {
    for (const [skillKey, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      
      // Content should have some structure (headings, lists, etc.)
      const hasMarkdownHeading = /#+ /.test(s.content);
      const hasNumberedList = /\d+\.\s+/.test(s.content);
      const hasBulletPoints = /[-•*]\s+/.test(s.content);
      
      expect(hasMarkdownHeading || hasNumberedList || hasBulletPoints).toBe(true);
    }
  });

  test("skill content should be markdown formatted", () => {
    for (const [skillKey, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      
      // Check for common markdown elements
      const markdownPatterns = [
        /#+ /,          // Headings
        /\*\*.*\*\*/,   // Bold
        /\n\s*\n/,      // Paragraphs
        /- \[[ x]\]/,   // Checkboxes
      ];
      
      const hasMarkdown = markdownPatterns.some(pattern => pattern.test(s.content));
      expect(hasMarkdown).toBe(true);
    }
  });
});

describe("Specific Skill Tests", () => {
  let debuggingSkill: Skill;
  let refactoringSkill: Skill;

  beforeAll(async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    debuggingSkill = skillsModule.debuggingSkill;
    refactoringSkill = skillsModule.refactoringSkill;
  });

  test("debugging skill should have debugging-related content", () => {
    expect(debuggingSkill.name).toContain("debug");
    expect(debuggingSkill.description.toLowerCase()).toContain("debug");
    expect(debuggingSkill.tags).toContain("debugging");
    expect(debuggingSkill.content.toLowerCase()).toContain("debug");
  });

  test("debugging skill should include systematic steps", () => {
    const hasSteps = /\d+\.\s+\*\*/.test(debuggingSkill.content);
    expect(hasSteps).toBe(true);
  });

  test("refactoring skill should have refactoring-related content", () => {
    expect(refactoringSkill.name).toContain("refactor");
    expect(refactoringSkill.description.toLowerCase()).toContain("refactor");
    expect(refactoringSkill.tags).toContain("refactoring");
    expect(refactoringSkill.content.toLowerCase()).toContain("refactor");
  });

  test("refactoring skill should include best practices", () => {
    const hasPrinciples = /\d+\.\s+\*\*/.test(refactoringSkill.content);
    expect(hasPrinciples).toBe(true);
  });
});

describe("Skill Registration Verification Tests", () => {
  test("skills can be registered with OpenCode format", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    const customSkills = skillsModule.customSkills;

    // Simulate OpenCode skill registration
    const registeredSkills = new Map();
    
    for (const [key, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      registeredSkills.set(s.name, {
        description: s.description,
        tags: s.tags,
        content: s.content,
      });
    }

    expect(registeredSkills.size).toBeGreaterThan(0);
    expect(registeredSkills.has("systematic-debugging")).toBe(true);
    expect(registeredSkills.has("safe-refactoring")).toBe(true);
  });

  test("skill configurations are serializable", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    const customSkills = skillsModule.customSkills;

    for (const [key, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      
      // Should be able to serialize to JSON
      const serialized = JSON.stringify(s);
      expect(serialized).toBeDefined();
      
      const deserialized = JSON.parse(serialized);
      expect(deserialized.name).toBe(s.name);
      expect(deserialized.content).toBe(s.content);
    }
  });

  test("skills have searchable tags", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    const customSkills = skillsModule.customSkills;

    const allTags = new Set<string>();
    
    for (const [key, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      s.tags.forEach(tag => allTags.add(tag));
    }

    // Should have a variety of tags for search/filtering
    expect(allTags.size).toBeGreaterThan(2);
  });
});

describe("Skill Validation Tests", () => {
  test("all skills have unique names", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    const customSkills = skillsModule.customSkills;

    const names = Object.values(customSkills).map((s: any) => s.name);
    const uniqueNames = new Set(names);
    
    expect(names.length).toBe(uniqueNames.size);
  });

  test("skill tags are consistent across skills", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    const customSkills = skillsModule.customSkills;

    const allTags = new Set<string>();
    
    for (const [key, skill] of Object.entries(customSkills)) {
      const s = skill as Skill;
      s.tags.forEach(tag => {
        // Tags should be lowercase, alphanumeric with hyphens
        expect(tag).toMatch(/^[a-z0-9-]+$/);
        allTags.add(tag);
      });
    }

    expect(allTags.size).toBeGreaterThan(0);
  });

  test("skills can be filtered by tags", async () => {
    const skillsModule = await import("../.opencode/skills/example-skills");
    const customSkills = skillsModule.customSkills;

    // Simulate filtering by tag
    const debuggingSkills = Object.values(customSkills).filter((s: any) =>
      s.tags.includes("debugging")
    );

    expect(debuggingSkills.length).toBeGreaterThan(0);
  });
});
