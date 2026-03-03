# Navigator Lock Timeout Fix - TODO

## Task
Fix Supabase Navigator Lock timeout error by preventing concurrent auth calls

## Plan
- [ ] 1. Update supabaseClient.js - Add minimal timeout configuration
- [ ] 2. Update supabaseAuth.js - Add promise guard to prevent concurrent auth calls
- [ ] 3. Update ProtectedRoute.jsx - Add try-catch with graceful error handling

## Implementation Approach (per user feedback)
- Use simple promise guard (not navigator.locks API)
- Create single source of truth for auth
- Prevent duplicate concurrent calls
- Keep it minimal for MVP stability
