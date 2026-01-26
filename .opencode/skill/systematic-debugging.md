---
name: systematic-debugging
description: 'A methodical approach to finding and fixing bugs with proven techniques'
license: MIT
compatibility: opencode
---

# Systematic Debugging

A comprehensive, step-by-step approach to debugging software issues effectively.

## When to Use This Skill

- When encountering unexpected behavior or errors
- When a feature isn't working as expected
- When performance issues arise
- When intermittent bugs occur

## The Debugging Process

### 1. Reproduce the Issue

**Goal**: Understand exactly what's happening and when.

- Document the exact steps to trigger the bug
- Note the environment (OS, browser, dependencies, etc.)
- Capture error messages, stack traces, or logs
- Test if the issue is consistent or intermittent
- Record what you expect vs. what actually happens

### 2. Isolate the Problem

**Goal**: Narrow down where the issue is occurring.

Techniques:
- **Binary Search**: Comment out half the code, test, repeat
- **Add Logging**: Insert console.log/print statements at key points
- **Check Recent Changes**: Review git history
  ```bash
  git log --oneline --since="1 week ago"
  git diff HEAD~5 -- path/to/file
  ```
- **Simplify**: Create a minimal reproduction case
- **Test Components**: Check each component in isolation

### 3. Gather Information

**Goal**: Collect all relevant data about the problem.

- Check logs (application, system, error tracking)
- Review configuration files
- Inspect database state if relevant
- Check network requests (DevTools Network tab)
- Examine memory/CPU usage if performance-related
- Look for patterns (timing, specific inputs, etc.)

### 4. Form Hypotheses

**Goal**: Create educated guesses about the cause.

- List all possible causes based on symptoms
- Prioritize by likelihood and impact
- Consider:
  - Input validation issues
  - Race conditions or timing issues
  - Missing error handling
  - Incorrect assumptions
  - Edge cases not handled
  - Configuration problems
  - External dependencies

### 5. Test Hypotheses

**Goal**: Systematically verify or eliminate each hypothesis.

Methods:
- **Unit Tests**: Write tests that expose the bug
- **Debugger**: Step through code execution
- **Assertions**: Add checks for expected state
- **Controlled Experiments**: Change one variable at a time
- **Rubber Duck Debugging**: Explain the code to someone (or something)

### 6. Implement the Fix

**Goal**: Solve the root cause, not just the symptom.

- Fix the underlying issue, not just the error message
- Consider if similar issues exist elsewhere
- Ensure the fix doesn't break other functionality
- Keep the fix as simple as possible

### 7. Verify the Solution

**Goal**: Confirm the bug is fixed and nothing broke.

- Test the original reproduction steps
- Run the full test suite
- Check edge cases and related functionality
- Test in different environments if applicable
- Have someone else verify if possible

### 8. Document and Learn

**Goal**: Prevent future issues and share knowledge.

- Add or update tests to prevent regression
- Document the bug and fix in commit messages
- Update code comments if the issue was subtle
- Share findings with the team (if applicable)
- Consider if architecture changes could prevent similar issues

## Common Debugging Tools

### JavaScript/TypeScript
```bash
# Browser DevTools
- Console tab: View logs and errors
- Sources tab: Set breakpoints, step through code
- Network tab: Inspect API calls
- Performance tab: Profile execution

# Node.js
node --inspect-brk app.js  # Debug with Chrome DevTools
```

### Python
```python
# Built-in debugger
import pdb; pdb.set_trace()

# Or use breakpoint() in Python 3.7+
breakpoint()
```

### Logging Best Practices
```typescript
// Add contextual information
console.log('[Component:Method]', 'Event happened', { data });

// Use different log levels
console.debug('Detailed info');
console.info('General info');
console.warn('Warning');
console.error('Error', error);
```

## Debugging Checklist

Before diving deep, check these common issues:

- [ ] Are dependencies installed and up to date?
- [ ] Is the environment configured correctly (.env files, config)?
- [ ] Are there any error messages in logs/console?
- [ ] Did recent code changes introduce the issue?
- [ ] Does restarting the application/service help?
- [ ] Is the issue reproducible in a different environment?
- [ ] Are there any external service dependencies that might be down?

## Advanced Techniques

### Heisenbug (intermittent issues)
- Add extensive logging
- Capture state at multiple points
- Look for race conditions
- Check timing-dependent code
- Use a debugger with conditional breakpoints

### Performance Issues
- Profile the application
- Check database query performance
- Look for n+1 queries
- Examine memory leaks
- Review algorithmic complexity

### Memory Leaks
- Use heap snapshots (browser DevTools or Node.js)
- Look for event listeners not removed
- Check for unclosed connections
- Review circular references
- Examine cache growth

## Tips for Effective Debugging

1. **Stay Systematic**: Don't jump to conclusions
2. **Take Breaks**: Fresh eyes catch bugs faster
3. **Keep Notes**: Document what you've tried
4. **Read Error Messages Carefully**: They often tell you exactly what's wrong
5. **Check Assumptions**: Verify what you think is true
6. **Start Simple**: Rule out obvious causes first
7. **Use Version Control**: Git bisect can find when a bug was introduced
8. **Ask for Help**: A second pair of eyes can spot issues quickly

## Common Pitfalls to Avoid

- Making multiple changes at once (can't tell what fixed it)
- Not testing the fix thoroughly
- Fixing symptoms instead of root cause
- Assuming the bug is in complex code (often it's simple)
- Debugging tired or frustrated (take a break)
- Not documenting the findings

## Integration with Bun Scripts

This template includes example debugging scripts in `package.json` and `.opencode/scripts/`:

```json
{
  "scripts": {
    "debug": "bun --inspect-brk index.ts",
    "debug:test": "bun test --inspect-brk"
  }
}
```

See `.opencode/scripts/debug-helper.ts` for additional debugging utilities that agents can discover and use.
