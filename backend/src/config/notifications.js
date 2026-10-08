const pool = require("./db");

// Uses Expo's push service. Never throws — a push failure must never turn a
// successful booking/approval into an error response.
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken) return;
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data,
        sound: "default",
        priority: "high",
        channelId: "default",
      }),
      signal: AbortSignal.timeout(8000),
    });
    const json = await res.json().catch(() => null);
    const ticket = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (ticket?.status === "error") {
      console.warn("Push ticket error:", ticket.message, ticket.details);
      // app uninstalled / token rotated — stop sending to it
      if (ticket.details?.error === "DeviceNotRegistered") {
        await pool
          .query("UPDATE users SET push_token = NULL WHERE push_token = $1", [pushToken])
          .catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Push send failed:", err.message);
  }
};

// fire-and-forget helper for request handlers
const notify = (...args) => {
  sendPushNotification(...args);
};

module.exports = { sendPushNotification, notify };
