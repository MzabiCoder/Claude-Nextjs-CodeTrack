import { Resend } from "resend";

/**
 * Lazily-constructed Resend client.
 *
 * The client used to be created at module scope, which meant importing this
 * file threw "Missing API key" before any code could run — breaking local
 * development even when `EMAIL_VERIFICATION_ENABLED=false` was set to skip
 * sending entirely. Deferring construction to first use keeps the public API
 * (`resend.emails.send(...)`) unchanged while making the failure happen only
 * when an email is genuinely being sent.
 */
let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to .env, or set EMAIL_VERIFICATION_ENABLED=false to skip sending emails in local development."
      );
    }
    client = new Resend(apiKey);
  }
  return client;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
