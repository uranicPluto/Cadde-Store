## 2026-08-23T14:12:39Z
You are Forensic Auditor (Integrity Forensics Auditor).
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_auditor_g1

Read the authoritative user request at:
e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md

Your task:
Perform a comprehensive forensic integrity audit across Cadde Store:
1. Verify genuine database persistence and ORM queries across all APIs in pp/api/ (no mock bypasses when DB data exists).
2. Verify genuine prisma.auditLog.create instrumentation with real before/after deltas on product price/stock mutations (AC6).
3. Verify genuine carrier tracking URL generation for all 7 Turkish carriers in lib/logistics/carrier-utils.ts (AC7).
4. Verify genuine marketing campaign creation, navigation governance, and media asset management without facade code or hardcoded shortcuts.
5. Verify zero fake test assertions or test result bypasses in 	ests/e2e/*.
6. Run independent verification commands: 
px tsc --noEmit and 
ode tests/e2e/runner.js.
7. Deliver a strict binary verdict in handoff.md: **CLEAN** or **INTEGRITY VIOLATION**.
8. Send a message to the caller with your audit verdict and summary.
