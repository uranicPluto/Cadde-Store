## 2026-08-23T04:34:00Z
Worker for Milestones M3 & M4: Multi-Vendor Logistics, Carrier Tracking & Returns/Refunds Lifecycle.
Authoritative request: e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md
Project specification: e:\Antigravity\Cadde Store\PROJECT.md
Survey handoff: e:\Antigravity\Cadde Store\.agents\teamwork_preview_explorer_survey_2\handoff.md

Exclusive write ownership:
- lib/logistics/carrier-utils.ts
- app/api/orders/seller/route.ts
- app/api/returns/route.ts
- app/api/returns/[id]/route.ts
- app/seller/dashboard/orders/[id]/page.tsx
- app/seller/dashboard/returns/page.tsx
- app/admin/returns/page.tsx
- components/account/return-request-modal.tsx
- app/account/orders/[id]/page.tsx

Task:
1. Create lib/logistics/carrier-utils.ts (Turkish carriers enum/types, getCarrierTrackingUrl, validateTrackingNumber).
2. Update app/api/orders/seller/route.ts (OrderGroup fulfillment, parent Order sync, OrderStatusHistory, Notification).
3. Update app/seller/dashboard/orders/[id]/page.tsx (Fulfillment controls, carrier dropdown, tracking input, status transitions, tracking link preview).
4. Implement components/account/return-request-modal.tsx (Delivered items return request modal, reason, photo evidence, refund amount calculation, POST /api/returns).
5. Update app/account/orders/[id]/page.tsx (Show carrier tracking buttons for seller groups, embed Return Request modal on delivered items).
6. Enhance app/api/returns/route.ts & app/api/returns/[id]/route.ts (GET, POST, PUT, AuditLog RETURN_REQUEST_MODERATED, notifications).
7. Implement app/seller/dashboard/returns/page.tsx (Seller returns moderation).
8. Implement app/admin/returns/page.tsx (Admin returns moderation panel).
9. Verification: npx tsc --noEmit, npm run build, node tests/e2e/runner.js.
10. Completion report in handoff.md and send_message to parent.
