# Auth Security Review

**Last audited**: 2026-06-01
**Auditor**: auth-auditor agent
**Scope**: NextAuth v5 Credentials + GitHub OAuth, email verification, password reset, profile page

---

## 🟠 HIGH

### Token deletion not atomic in password reset

- **File**: `src/app/api/auth/reset-password/route.ts` (lines 38–43)
- **Problem**: The password is updated first, then the token is deleted as a separate operation. If the delete call fails (network blip, DB connection drop), the user's password has been changed but the reset token remains valid in the database. An attacker who intercepted the reset link could replay it — submitting a new password of their choosing — and the route would accept it because the token still exists and has not expired.
- **Fix**: Wrap both operations in a Prisma transaction so they succeed or fail together:
  ```ts
  await prisma.$transaction([
    prisma.verificationToken.delete({ where: { token } }),
    prisma.user.update({ where: { email }, data: { password: hashed } }),
  ]);
  ```

---

## 🟡 MEDIUM

### No rate limiting on forgot-password endpoint

- **File**: `src/app/api/auth/forgot-password/route.ts`
- **Problem**: The endpoint has no request rate limiting. Two practical risks:
  1. **Email bombing** — an attacker can trigger unlimited password-reset emails to a valid address, filling the target's inbox.
  2. **Timing-based user enumeration** — when a user exists, the route does a DB write + Resend API call (several hundred ms); when a user does not exist, it returns immediately. An attacker can distinguish registered from unregistered emails by measuring response latency, despite the response body being identical.
- **Fix**: Add rate limiting keyed on source IP (e.g., Upstash Ratelimit, or a Vercel Edge middleware counter). For the timing issue, add a constant-time minimum delay before returning, or move the "user not found" response to after the Resend await:
  ```ts
  // Same code path length regardless of whether user exists
  const shouldSend = !!user?.password;
  if (shouldSend) { /* create token + send email */ }
  await new Promise(r => setTimeout(r, 300)); // normalize timing
  return NextResponse.json({ success: true });
  ```

---

## 🟢 LOW

### `oauthOnly: true` response body confirms email is registered

- **File**: `src/app/api/auth/forgot-password/route.ts` (line 21)
- **Problem**: When the email belongs to a GitHub-only account, the route returns `{ oauthOnly: true }` with a 200. This explicitly tells the caller that the email address is registered in the system, just under a different auth method. The uniform `{ success: true }` response for unknown emails makes it easy to enumerate GitHub-linked accounts by comparing response bodies.
- **Fix**: Return `{ success: true }` for all cases and handle the GitHub account hint on the client using a heuristic (e.g., if the user previously signed in with GitHub, show the hint). If the UX hint is important enough to keep, this is an accepted tradeoff — just document it.

---

### `getProfileData` returns the raw password hash to the caller

- **File**: `src/lib/db/profile.ts` (line 12), `src/app/profile/page.tsx` (line 37)
- **Problem**: `getProfileData` selects `password: true` and returns the full user object including the bcrypt hash. The profile page only uses this to derive a boolean (`!!user.password`). The hash is never serialized to the client (it's a server component), but passing raw credential material through unnecessary code paths increases the blast radius if the pattern is copied to a context where `user` is passed as a prop to a client component.
- **Fix**: Return the boolean instead of the hash:
  ```ts
  // In getProfileData return value:
  return { user: { ...user, password: undefined }, hasPassword: !!user.password, stats };
  // Or add to the select: isCredentialsUser: !!user.password (compute in DB layer)
  ```

---

### `verify-email` route has no try/catch

- **File**: `src/app/api/auth/verify-email/route.ts`
- **Problem**: Unlike every other API route in the auth surface, this one has no try/catch. A Prisma connection error, a malformed token causing an unexpected query failure, or any other runtime exception will produce an unhandled rejection. Next.js will return a 500 with a generic error page rather than the graceful redirect the user expects. This also means the token may not be cleaned up on certain error paths.
- **Fix**: Wrap the handler body in try/catch and redirect to an error state on failure, consistent with the other auth routes.

---

### No email format validation on registration

- **File**: `src/app/api/auth/register/route.ts` (lines 12–17)
- **Problem**: The register route checks that `email` is truthy but does not validate it as a properly formatted email address. A value like `"notanemail"` or `"a@"` will create a user record. The email verification flow partially mitigates this (a garbage email won't receive the verification link), but a junk user record is still written to the database, and the user object is in an unverified limbo state.
- **Fix**: Add a simple format check before the DB write:
  ```ts
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  ```
  Or use Zod: `z.string().email()`.

---

## ✅ Passed Checks

**Password hashing**
- bcrypt used with 12 rounds in all three hashing sites: `register/route.ts:32`, `reset-password/route.ts:36`, `change-password/route.ts:44`
- `bcrypt.compare()` used for all password comparisons — timing-safe (`auth.ts:43`, `change-password/route.ts:39`)
- Plain-text passwords never logged or included in any API response

**Token generation**
- `randomUUID()` from Node's built-in `crypto` module used for all token generation — cryptographically random, not `Math.random()` (`register/route.ts:3,43`, `forgot-password/route.ts:2,31`)

**Email verification token security**
- Expiry checked *before* setting `emailVerified` — expired tokens are rejected and deleted (`verify-email/route.ts:18–21`)
- Token deleted after use — single-use enforced (`verify-email/route.ts:28`)
- Token scoped to specific email via `identifier` field — cross-user replay is not possible

**Password reset token security**
- `"reset:"` prefix check enforced on the reset route (`reset-password/route.ts:26`) — an email-verification token cannot be used to reset a password (cross-flow token confusion prevented)
- Expiry enforced at 1 hour (`forgot-password/route.ts:32`, `reset-password/route.ts:30`)
- Existing reset tokens deleted before issuing a new one — no token accumulation (`forgot-password/route.ts:27–29`)

**Session validation**
- `auth()` called and session checked with early `401` return on both `POST /api/user/change-password` and `DELETE /api/user` — unauthenticated requests cannot reach the DB operations
- Profile server component calls `auth()` and redirects unauthenticated users — not relying on middleware alone as the only guard

**Authorization / no IDOR**
- `DELETE /api/user` deletes by `session.user.id` only — a logged-in user cannot delete another account
- `POST /api/user/change-password` fetches user by `session.user.id` and updates by the same ID — no IDOR risk

**Session data hygiene**
- The `session` callback in `auth.ts` only adds `user.id` to the session — the password hash is never included in the JWT or client-visible session object

**User enumeration (response body)**
- Forgot-password returns `{ success: true }` for non-existent emails — attacker cannot confirm email registration via response body alone (timing attack is a separate finding above)

---

## Summary

1 high, 1 medium, 4 low issues found. **Top priority**: wrap the password update + token delete in a Prisma transaction (`reset-password/route.ts`) — this is the only finding that creates a narrow but real window for an attacker to take over a reset account. The rate limiting gap is worth addressing before any production launch.
