# Core Agent Behaviors & Rules

## Verification & QA Protocol
Whenever any new feature is implemented, the acting agent (or a delegated subagent) MUST follow a strict Verification & Bug Fixing Workflow:
1. **Test the Implementation**: Do not assume the code works just because it was written. Verify its behavior.
2. **Check Edge Cases**: Proactively think about how the feature might break (e.g., streaming rendering issues, invalid input, syntax errors from AI generation) and handle those gracefully.
3. **Proactive Bug Fixing**: If a bug is found during verification, immediately fix it before proceeding.
4. **Stable Delivery**: The feature must remain completely stable without regressions. 

**Rule**: Never mark a task as fully complete without verifying it works perfectly in the context of the larger application.
