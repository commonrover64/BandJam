// uses Expo's push notification service — free, no account needed
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: pushToken,
      title,
      body,
      data,
      sound: "default",
      priority: "high",
    }),
  });
};

module.exports = { sendPushNotification };