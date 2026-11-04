const axios = require('axios');

/**
 * Simple notification service wrapper.
 * In production you would plug in Twilio, WhatsApp Cloud API, etc.
 *
 * Configuration (via environment variables in a .env file):
 * - NOTIFY_PROVIDER: "twilio-sms" | "twilio-whatsapp" | "mock"
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_FROM_SMS
 * - TWILIO_FROM_WHATSAPP
 */

const PROVIDER = process.env.NOTIFY_PROVIDER || 'mock';

async function sendNotification({ to, channel, body }) {
  if (!to || !body) {
    return { ok: false, error: 'Missing recipient or message' };
  }

  if (PROVIDER === 'mock') {
    console.log(`[MOCK NOTIFICATION] (${channel}) -> ${to}: ${body}`);
    return { ok: true, providerMessageId: 'mock-' + Date.now() };
  }

  if (PROVIDER === 'twilio-sms' || PROVIDER === 'twilio-whatsapp') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromSms = process.env.TWILIO_FROM_SMS;
    const fromWhatsApp = process.env.TWILIO_FROM_WHATSAPP;

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials missing; falling back to mock.');
      console.log(`[MOCK NOTIFICATION] (${channel}) -> ${to}: ${body}`);
      return { ok: true, providerMessageId: 'mock-' + Date.now() };
    }

    const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = {
      username: accountSid,
      password: authToken,
    };

    const from =
      channel === 'whatsapp'
        ? fromWhatsApp || undefined
        : fromSms || undefined;

    if (!from) {
      console.warn('Twilio FROM number missing; falling back to mock.');
      console.log(`[MOCK NOTIFICATION] (${channel}) -> ${to}: ${body}`);
      return { ok: true, providerMessageId: 'mock-' + Date.now() };
    }

    const params = new URLSearchParams();
    params.append('To', channel === 'whatsapp' ? `whatsapp:${to}` : to);
    params.append('From', channel === 'whatsapp' ? from : from);
    params.append('Body', body);

    try {
      const response = await axios.post(baseUrl, params, {
        auth,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return { ok: true, providerMessageId: response.data.sid };
    } catch (err) {
      console.error('Error sending Twilio message', err.response?.data || err.message);
      return {
        ok: false,
        error: err.response?.data || err.message,
      };
    }
  }

  console.warn(`Unknown notification provider "${PROVIDER}", using mock.`);
  console.log(`[MOCK NOTIFICATION] (${channel}) -> ${to}: ${body}`);
  return { ok: true, providerMessageId: 'mock-' + Date.now() };
}

module.exports = {
  sendNotification,
};

