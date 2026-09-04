import { getEnv, getOptionalEnv } from "../env";

interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

// Without RESEND_API_KEY the message is logged instead of sent, so local
// development and CI need no email provider configured.
export async function sendMail(message: MailMessage): Promise<void> {
  const apiKey = getOptionalEnv("RESEND_API_KEY");
  const from = getEnv("MAIL_FROM", "SAMADHAN <onboarding@resend.dev>");

  if (!apiKey) {
    console.info(
      `[mail:dev] to=${message.to} subject=${JSON.stringify(message.subject)}\n${message.text}`
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text
    })
  });

  if (!response.ok) {
    console.error(`[mail] send failed: ${response.status}`);
  }
}
