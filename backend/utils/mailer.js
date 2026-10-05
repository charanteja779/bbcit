const path = require("path");
const Mailjet = require("node-mailjet");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  quiet: true,
});

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) throw new Error("Recipient email is required");

  const publicKey = process.env.MJ_APIKEY_PUBLIC;
  const privateKey = process.env.MJ_APIKEY_PRIVATE;
  const fromEmail = process.env.MJ_FROM_EMAIL;
  if (!publicKey || !privateKey || !fromEmail) {
    throw new Error("Mailjet is not configured; check the backend environment variables");
  }

  try {
    const response = await Mailjet.apiConnect(publicKey, privateKey)
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: { Email: fromEmail, Name: process.env.MJ_FROM_NAME || "BBCIT" },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
          },
        ],
      });

    const result = response.body?.Messages?.[0];
    if (!result || result.Status?.toLowerCase() !== "success") {
      const reasons = (result?.Errors || [])
        .map((entry) => entry.ErrorMessage)
        .filter(Boolean);
      throw new Error(reasons.join("; ") || "Mailjet rejected the message");
    }

    return response.body;
  } catch (error) {
    const providerMessages = (error.response?.body?.Messages || [])
      .flatMap((message) => message.Errors || [])
      .map((entry) => entry.ErrorMessage)
      .filter(Boolean);
    const providerMessage = providerMessages.join("; ");
    const deliveryError = new Error(providerMessage || error.message || "Mailjet request failed");
    console.error("Mailjet email send failed:", deliveryError.message);
    throw deliveryError;
  }
};

module.exports = { sendEmail };