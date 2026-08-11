import express from 'express';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

const app = express();
const PORT = 4173;
const rpID = 'localhost';
const origin = `http://localhost:${PORT}`;
const user = { id: 'pass-tate-test-user', username: 'test@passtatedemo.local', password: 'initial-test-password' };
let credential;
let registrationChallenge;
let authenticationChallenge;
let signedIn = false;
const audit = [];

app.use(express.json());
app.use(express.static('public'));
app.use('/vendor', express.static('node_modules/@simplewebauthn/browser/dist/bundle'));
const event = (action, detail) => audit.unshift({ at: new Date().toISOString(), action, detail });

app.get('/api/status', (_req, res) => res.json({ passkeyRegistered: Boolean(credential), signedIn, passwordVersion: audit.filter(x => x.action === 'password_rotated').length + 1, audit }));

app.post('/api/passkey/register/options', async (_req, res) => {
  const options = await generateRegistrationOptions({ rpName: 'Pass Tate Test Service', rpID, userName: user.username, userID: user.id, attestationType: 'none', authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' }, excludeCredentials: credential ? [{ id: credential.id, transports: credential.transports }] : [] });
  registrationChallenge = options.challenge;
  res.json(options);
});

app.post('/api/passkey/register/verify', async (req, res) => {
  try {
    const verification = await verifyRegistrationResponse({ response: req.body, expectedChallenge: registrationChallenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: false });
    if (verification.verified) {
      credential = verification.registrationInfo.credential;
      event('passkey_registered', 'A browser-managed passkey was registered for the local test account.');
    }
    res.json({ verified: verification.verified });
  } catch (error) { res.status(400).json({ verified: false, error: error.message }); }
});

app.post('/api/passkey/auth/options', async (_req, res) => {
  if (!credential) return res.status(400).json({ error: 'Register a passkey first.' });
  const options = await generateAuthenticationOptions({ rpID, allowCredentials: [{ id: credential.id, transports: credential.transports }], userVerification: 'preferred' });
  authenticationChallenge = options.challenge;
  res.json(options);
});

app.post('/api/passkey/auth/verify', async (req, res) => {
  try {
    const verification = await verifyAuthenticationResponse({ response: req.body, expectedChallenge: authenticationChallenge, expectedOrigin: origin, expectedRPID: rpID, credential, requireUserVerification: false });
    signedIn = verification.verified;
    if (signedIn) { credential.counter = verification.authenticationInfo.newCounter; event('passkey_authenticated', 'The local service verified the passkey assertion.'); }
    res.json({ verified: signedIn });
  } catch (error) { res.status(400).json({ verified: false, error: error.message }); }
});

app.post('/api/rotate', (_req, res) => {
  if (!signedIn) return res.status(401).json({ error: 'A verified passkey sign-in is required before rotation.' });
  user.password = crypto.randomUUID();
  signedIn = false;
  event('password_rotated', 'The protected test password was replaced after verified passkey sign-in.');
  res.json({ rotated: true });
});

app.listen(PORT, () => console.log(`Pass Tate POC running at ${origin}`));
