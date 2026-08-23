## 2026-08-23T02:26:45Z
You are the Forensic Auditor for Cadde Store.
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_auditor_1
Authoritative request: e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md
Project specification: e:\Antigravity\Cadde Store\PROJECT.md

Your task:
1. Conduct full forensic integrity verification across all codebase files:
   - Check for hardcoded test results, test-specific mocks in production code, dummy facades, or shortcuts.
   - Verify that all database mutations (orders, products, brands, cms, categories, reviews, returns, settings) genuinely interact with Prisma ORM / SQLite / PostgreSQL.
   - Verify that AuditLog instrumentation is genuinely recording real database entries.
   - Verify that Turkish carrier tracking URLs, KVKK disclosures, and translations are genuine.
2. Run static analysis and runtime tests to prove genuine implementation.
3. Formulate binary verdict: CLEAN or INTEGRITY VIOLATION.
4. Write full forensic evidence report to `e:\Antigravity\Cadde Store\.agents\teamwork_preview_auditor_1\handoff.md` and send a completion message with your verdict.
