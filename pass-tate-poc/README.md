# Pass Tate flow proof of concept

This local service demonstrates a real WebAuthn passkey registration and authentication ceremony. After successful authentication, it authorizes a protected test password rotation endpoint.

It is deliberately limited to a disposable local test account. It does not store real user passwords, automate third-party services, or provide production-grade key management.

## Run

Install dependencies, then start the service. Open the local address shown in the console in a browser with passkey support.

## Test sequence

1. Register a passkey for the local test account.
2. Authenticate with the registered passkey.
3. Rotate the test account password through the protected endpoint.
4. Inspect the result panel and server audit events.
