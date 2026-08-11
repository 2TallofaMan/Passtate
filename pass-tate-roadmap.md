# Pass Tate Roadmap

## Product definition

Pass Tate is a password manager with scheduled password rotation as its differentiating feature. Each account can use automatic, approval-required, or reminder-only rotation.

## Phase 1A — Flow proof of concept

**Goal:** Prove the core credential and rotation flow before building an app interface.

- Run a local test service with a protected password-change endpoint.
- Register a real browser-managed WebAuthn passkey.
- Verify a standard passkey authentication response server-side.
- Allow rotation only after successful authentication.
- Record clear audit events and results.

**Done when:** The test flow registers a passkey, signs in with it, changes a password, and confirms the result.

## Next phases

- **Phase 1B:** Password-manager app shell with sample accounts and three rotation modes.
- **Phase 2:** Production encrypted vault, recovery, AutoFill, and passkey-provider integration.
- **Phase 3:** External connectors and notification-based approvals.
