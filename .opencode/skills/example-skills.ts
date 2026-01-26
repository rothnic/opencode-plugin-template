/**
 * Example skills for OpenCode plugin
 * 
 * Skills are reusable patterns and procedures that agents can leverage
 * to accomplish specific tasks more effectively.
 */

export interface Skill {
  name: string;
  description: string;
  tags: string[];
  content: string;
}

/**
 * Example debugging skill
 */
export const debuggingSkill: Skill = {
  name: "systematic-debugging",
  description: "A systematic approach to debugging issues in code",
  tags: ["debugging", "troubleshooting", "problem-solving"],
  content: `
# Systematic Debugging Approach

When debugging issues, follow these steps:

1. **Reproduce the Issue**
   - Understand the exact conditions that trigger the bug
   - Document steps to reproduce consistently

2. **Isolate the Problem**
   - Use binary search to narrow down the problematic code
   - Add logging at key points
   - Check recent changes (git log)

3. **Form Hypotheses**
   - List possible causes
   - Prioritize based on likelihood

4. **Test Hypotheses**
   - Use debuggers, print statements, or unit tests
   - Eliminate causes one by one

5. **Fix and Verify**
   - Implement the fix
   - Add regression tests
   - Verify the fix doesn't break anything else

6. **Document**
   - Update comments or docs if needed
   - Share learnings with the team
`,
};

/**
 * Example refactoring skill
 */
export const refactoringSkill: Skill = {
  name: "safe-refactoring",
  description: "Guidelines for safely refactoring code",
  tags: ["refactoring", "code-quality", "best-practices"],
  content: `
# Safe Refactoring Process

When refactoring code, follow these principles:

1. **Ensure Test Coverage**
   - Run existing tests first
   - Add tests if coverage is lacking
   - Tests should pass before refactoring

2. **Make Small Changes**
   - Refactor in small, incremental steps
   - Commit after each successful change
   - Keep changes focused and reviewable

3. **Common Refactoring Patterns**
   - Extract method/function
   - Rename for clarity
   - Remove duplication
   - Simplify conditionals
   - Improve data structures

4. **Verify After Each Change**
   - Run tests after every change
   - Check performance if relevant
   - Review diffs carefully

5. **Document Intent**
   - Update comments if needed
   - Keep commit messages clear
   - Note any breaking changes
`,
};

/**
 * Skills registry
 * Add your custom skills here
 */
export const customSkills = {
  debugging: debuggingSkill,
  refactoring: refactoringSkill,
};
