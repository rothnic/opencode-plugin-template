---
name: safe-refactoring
description: 'Guidelines and best practices for refactoring code safely without breaking functionality'
license: MIT
compatibility: opencode
---

# Safe Refactoring

A comprehensive guide to refactoring code safely, maintaining functionality while improving code quality, maintainability, and performance.

## When to Refactor

Refactoring is appropriate when:
- Code is difficult to understand or modify
- There's significant duplication
- Functions/methods are too long or complex
- Adding new features becomes increasingly difficult
- Code has many conditional branches
- Test coverage exists to verify behavior

**Don't refactor when:**
- There are no tests (write tests first)
- You're under a tight deadline (technical debt is okay temporarily)
- The code works and rarely needs changes
- You don't understand what the code does yet

## Core Principles

### 1. Always Have Tests First

Before refactoring:
```bash
# Ensure all tests pass
bun test

# Check test coverage
bun test --coverage

# If coverage is low, add tests first
```

**Rule**: Green tests before refactoring, green tests after.

### 2. Make Small, Incremental Changes

- Refactor one thing at a time
- Commit after each successful change
- Each commit should keep tests passing
- If a change breaks things, it's easy to revert

### 3. Understand Before Changing

- Read and comprehend the existing code
- Identify what it does and why
- Look for edge cases and special handling
- Check git history for context (`git log`, `git blame`)

## Common Refactoring Patterns

### Extract Method/Function

**Before:**
```typescript
function processOrder(order: Order) {
  // Validate order
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customerId) {
    throw new Error('Order must have customer');
  }
  
  // Calculate total
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  
  // Apply discount
  if (order.couponCode) {
    const discount = lookupDiscount(order.couponCode);
    total = total * (1 - discount);
  }
  
  return total;
}
```

**After:**
```typescript
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order);
  return applyDiscount(total, order.couponCode);
}

function validateOrder(order: Order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customerId) {
    throw new Error('Order must have customer');
  }
}

function calculateTotal(order: Order): number {
  return order.items.reduce((sum, item) => 
    sum + item.price * item.quantity, 0
  );
}

function applyDiscount(total: number, couponCode?: string): number {
  if (!couponCode) return total;
  const discount = lookupDiscount(couponCode);
  return total * (1 - discount);
}
```

### Rename for Clarity

Improve names to reveal intent:

```typescript
// Before
function calc(a: number, b: number): number {
  return a * b * 0.9;
}

// After
function calculateDiscountedPrice(
  originalPrice: number,
  quantity: number
): number {
  const subtotal = originalPrice * quantity;
  const discountRate = 0.9;
  return subtotal * discountRate;
}
```

### Remove Duplication (DRY)

**Before:**
```typescript
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

function formatEmployeeName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`;
}
```

**After:**
```typescript
function formatFullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`;
}
```

### Simplify Conditionals

**Before:**
```typescript
function getShippingCost(order: Order): number {
  if (order.total > 100) {
    return 0;
  } else {
    if (order.isPriority) {
      return 15;
    } else {
      return 5;
    }
  }
}
```

**After:**
```typescript
function getShippingCost(order: Order): number {
  if (order.total > 100) return 0;
  return order.isPriority ? 15 : 5;
}
```

Or even better with early returns:
```typescript
function getShippingCost(order: Order): number {
  if (order.total > 100) return 0;
  if (order.isPriority) return 15;
  return 5;
}
```

### Replace Magic Numbers with Constants

**Before:**
```typescript
function calculateDiscount(price: number): number {
  return price * 0.15;
}

function isEligibleForDiscount(orderCount: number): boolean {
  return orderCount >= 5;
}
```

**After:**
```typescript
const DISCOUNT_RATE = 0.15;
const MIN_ORDERS_FOR_DISCOUNT = 5;

function calculateDiscount(price: number): number {
  return price * DISCOUNT_RATE;
}

function isEligibleForDiscount(orderCount: number): boolean {
  return orderCount >= MIN_ORDERS_FOR_DISCOUNT;
}
```

### Improve Data Structures

**Before:**
```typescript
function findUserById(users: User[], id: string): User | undefined {
  return users.find(u => u.id === id); // O(n) lookup
}
```

**After:**
```typescript
// Use a Map for O(1) lookups
class UserRepository {
  private users: Map<string, User>;
  
  constructor(users: User[]) {
    this.users = new Map(users.map(u => [u.id, u]));
  }
  
  findById(id: string): User | undefined {
    return this.users.get(id);
  }
}
```

## The Refactoring Workflow

### Step-by-Step Process

1. **Ensure Tests Pass**
   ```bash
   bun test
   ```

2. **Make One Change**
   - Choose a single refactoring pattern
   - Apply it to one location
   - Keep the change small and focused

3. **Run Tests**
   ```bash
   bun test
   ```

4. **Review the Diff**
   ```bash
   git diff
   ```
   - Verify no unintended changes
   - Check that logic is preserved

5. **Commit**
   ```bash
   git add .
   git commit -m "refactor: extract validation logic into separate function"
   ```

6. **Repeat**
   - Continue with next refactoring
   - Keep commits small and atomic

### Safety Checks

Before considering a refactoring complete:

- [ ] All tests still pass
- [ ] Code coverage hasn't decreased
- [ ] No compiler/linter errors
- [ ] Performance is not degraded (profile if needed)
- [ ] Code is more readable/maintainable
- [ ] Edge cases are still handled
- [ ] Documentation is updated if needed

## Refactoring Tools

### Automated Refactoring

Many IDEs provide safe automated refactorings:
- Rename symbol (updates all references)
- Extract function/method
- Inline variable/function
- Move file/module
- Change function signature

**Always use IDE refactoring tools when available** - they're safer than manual find-and-replace.

### TypeScript Benefits

TypeScript's type system helps with safe refactoring:

```typescript
// Change a type definition
interface User {
  id: string;
  name: string;
  email: string; // Add new required field
}

// TypeScript will show errors everywhere this type is used,
// helping you update all usages
```

### Testing During Refactoring

```bash
# Watch mode - tests run automatically on changes
bun test --watch

# Test a specific file while refactoring
bun test path/to/test.test.ts --watch
```

## Common Refactoring Mistakes

### 1. Changing Behavior While Refactoring

❌ **Wrong:**
```typescript
// During refactoring, also fixing a bug or adding a feature
function processItems(items: Item[]): Item[] {
  const processed = items.map(item => transform(item));
  return processed.filter(item => item.isValid); // Added validation
}
```

✅ **Right:**
- First commit: Fix the bug or add the feature
- Second commit: Refactor the resulting code

### 2. Refactoring Without Tests

Always write tests before refactoring untested code.

### 3. Too Large Changes

Break large refactorings into smaller steps.

### 4. Changing Multiple Things

Focus on one type of improvement at a time.

### 5. Not Reviewing Diffs

Always review your changes carefully before committing.

## Code Smells That Need Refactoring

### Long Functions
- More than 20-30 lines
- Multiple levels of nesting
- **Fix**: Extract smaller functions

### Large Classes
- Too many responsibilities
- **Fix**: Split into multiple classes

### Long Parameter Lists
- More than 3-4 parameters
- **Fix**: Use object parameters or builder pattern

### Duplicated Code
- Same logic in multiple places
- **Fix**: Extract to shared function/module

### Complex Conditionals
- Nested if/else statements
- Multiple boolean conditions
- **Fix**: Extract to well-named functions, use early returns

### Dead Code
- Unused functions, variables, or files
- **Fix**: Delete it (version control preserves history)

## Advanced Refactoring Techniques

### Strangler Fig Pattern

For large refactorings, gradually replace old code:

1. Create new implementation alongside old
2. Route some traffic to new implementation
3. Gradually increase new implementation usage
4. Remove old implementation when safe

### Refactoring Legacy Code

```typescript
// 1. Add characterization tests (tests that document current behavior)
// 2. Refactor small pieces at a time
// 3. Gradually improve test quality
// 4. Eventually replace with proper unit tests
```

### Performance-Driven Refactoring

```bash
# Profile before refactoring
bun --prof index.ts

# Refactor

# Profile after and compare
bun --prof index.ts
```

## Integration with Development Workflow

### Pre-Refactoring Checklist

```bash
# 1. Checkout a new branch
git checkout -b refactor/improve-user-service

# 2. Ensure clean slate
git status

# 3. Run tests
bun test

# 4. Check for uncommitted changes
git diff
```

### During Refactoring

Use the provided refactoring helper scripts:

```bash
# Run continuous testing
bun run test:watch

# Check code coverage
bun run test:coverage

# Lint while refactoring
bun run lint:watch
```

### Post-Refactoring

```bash
# 1. Run full test suite
bun test

# 2. Check lint
bun run lint

# 3. Review all changes
git diff main

# 4. Create PR with clear description
gh pr create --title "refactor: improve user service structure"
```

## Documentation and Communication

### Commit Messages

Good refactoring commit messages:
```
refactor: extract validation logic from processOrder

- Created validateOrder(), calculateTotal(), and applyDiscount()
- Improved testability and readability
- No behavior changes
```

### Code Comments

Update comments when refactoring:
```typescript
// Before refactoring, remove outdated comments
// After refactoring, add comments only for non-obvious logic
```

### Team Communication

- Share refactoring plans for large changes
- Get code reviews for refactorings
- Document architectural decisions
- Consider pairing for complex refactorings

## Resources

### Bun Scripts for Refactoring

This template includes helpful scripts in `.opencode/scripts/`:
- `refactor-helper.ts` - Utilities for safe refactoring
- `test-coverage.ts` - Coverage analysis
- `complexity-check.ts` - Identify complex code

Reference these in your refactoring work with:
```typescript
// Agents can discover and use these scripts
`@.opencode/scripts/refactor-helper.ts`
```

### Recommended Reading

- "Refactoring" by Martin Fowler
- "Working Effectively with Legacy Code" by Michael Feathers
- "Clean Code" by Robert C. Martin
