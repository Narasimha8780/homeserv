// WhatsApp Cloud API sender for the OTP "authentication" template.
// Configured entirely through env vars; when they are missing the API stays in mock mode.
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsappOtp(phone10, code) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: `91${phone10}`,
    type: 'template',
    template: {
      name: process.env.WHATSAPP_TEMPLATE_NAME || 'homeserv_otp',
      language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
      components: [
        { type: 'body', parameters: [{ type: 'text', text: code }] },
        // The "copy code" button of an authentication template also takes the code.
        { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
      ],
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`WhatsApp send failed (${resp.status}): ${detail}`);
  }
}
