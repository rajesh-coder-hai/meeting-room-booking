// services/notificationService.js
const axios = require("axios"); // Or use node-fetch or specific SDKs (e.g., Twilio)
const TEAMS_WEBHOOK_URL =
  "https://universityofcleveland.webhook.office.com/webhookb2/4b1f7cd3-c733-4cfb-8208-db932729a297@9810f93f-68e8-41cb-92b6-fc7e27d15e83/IncomingWebhook/4b46968d6bd7479dbdfc47c29462666f/74769a65-e308-44da-9ad0-1c281d19d7f2/V2h0xCN8KKOh5gQgSWwURCh967REL0VvtwEpN2hmJeW_81";

// --- Helper function to format order details ---
function formatOrderForNotification(order, user) {
  // --- Make Item Summary more readable ---
  let itemDetails = order.items
    .map(
      (item) =>
        `- ${item.quantity} x ${item.menuItem.name}` +
        (item.selectedOptions?.sweetness
          ? ` (${item.selectedOptions.sweetness.replace("_", " ")})`
          : "") +
        ` @ ₹${item.priceAtOrderTime}` // Added space before @
    )
    .join("\n");
  // --- ---

  // --- Format User Name/ID (Truncate ID if too long) ---
  let userIdSuffix = order.user.toString(); // Get the ObjectId as string
  let userNameOrId =
    user.displayName || `User ID: ...${userIdSuffix.slice(-4)}`; // Use name or truncated ID
  // --- ---

  // --- Format Location ---
  let deliveryLocation =
    order.deliveryLocationType === "meeting_room"
      ? `Meeting Room: ${order.deliveryLocationDetails}`
      : "Canteen";
  // --- ---

  // --- Format Order ID (Truncate) ---
  let orderIdSuffix = order._id.toString().slice(-6); // Get last 6 chars of Order ID
  // --- ---

  return {
    orderIdShort: orderIdSuffix, // Short ID for display
    userNameOrId: userNameOrId,
    totalPrice: order.totalPrice,
    deliveryLocation: deliveryLocation,
    itemsSummary: itemDetails,
    // Use more readable date/time format, including timezone
    orderTime: order.orderTime.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }),
  };
}

const notificationService = {
  /**
   * Sends notification to Teams (Guard) and WhatsApp (Caterer)
   * IMPORTANT: This function should run asynchronously and not block the order response.
   * @param {object} order - The newly created Mongoose Order object (populated)
   * @param {object} user - The user object from req.user
   */
  sendOrderNotifications: async (order, user) => {
    console.log(`Notification process started for Order ID: ${order._id}`);
    const details = formatOrderForNotification(order, user);

    // --- Send to Microsoft Teams (Guard) ---
    if (TEAMS_WEBHOOK_URL) {
      const teamsPayload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        themeColor: "0076D7",
        summary: `New Order ${details.orderIdShort} for ${details.deliveryLocation}`,
        sections: [
          {
            activityTitle: `🍕 New Order Received! (ID: ${details.orderIdShort})`,
            activitySubtitle: `Placed by: ${details.userNameOrId} at ${details.orderTime}`,
            facts: [
              { name: "Deliver To", value: `**${details.deliveryLocation}**` },
              { name: "Total Amount", value: `₹${details.totalPrice}` },
              { name: "Items", value: details.itemsSummary },
            ],
            markdown: true,
          },
        ],
      };
      try {
        await axios.post(TEAMS_WEBHOOK_URL, teamsPayload);
        console.log(`Teams notification sent for Order ID: ${order._id}`);
      } catch (error) {
        console.error(
          `Error sending Teams notification for Order ${order._id}:`,
          error.response?.data || error.message
        );
        // Add more robust error logging/handling (e.g., retry queue) if needed
      }
    } else {
      console.warn(
        `TEAMS_WEBHOOK_URL not set. Skipping Teams notification for Order ${order._id}.`
      );
    }

    // --- Send to WhatsApp (Caterer) ---
    // Replace with actual implementation using Twilio, etc.
    if (
      process.env.WHATSAPP_PROVIDER === "TWILIO" &&
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM &&
      process.env.CATERER_WHATSAPP_NUMBER
    ) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require("twilio")(accountSid, authToken);

      // --- CONSTRUCT THE NEW WHATSAPP MESSAGE ---
      const whatsappMessage = `✨ *New Order Incoming!* ✨

*Delivery Details:*
📍 Location: *${details.deliveryLocation}*
👤 Ordered By: ${details.userNameOrId}
⏰ Time: ${details.orderTime}

*Order Summary:* (ID: ...${details.orderIdShort})
--------------------
${details.itemsSummary}
--------------------
💰 *Total Amount: ₹${details.totalPrice}*

Ready for preparation. Thanks! 🙏☕`;
      // --- END OF NEW MESSAGE CONSTRUCTION ---

      try {
        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          body: whatsappMessage,
          to: process.env.CATERER_WHATSAPP_NUMBER,
        });
        console.log(`WhatsApp notification sent for Order ID: ${order._id}`);
      } catch (error) {
        console.error(
          `Error sending WhatsApp notification for Order ${order._id}:`,
          error.message
        );
      }
    } else {
      console.warn(`WhatsApp credentials not fully set...`);
      // Log simulation with new format if needed for testing without credentials
      console.log(`--- WHATSAPP SIMULATION (Order ${order._id}) ---`);
      const simulatedMessage = `✨ *New Order Incoming!* ✨\n\n*Delivery Details:*\n📍 Location: *${details.deliveryLocation}*\n👤 Ordered By: ${details.userNameOrId}\n⏰ Time: ${details.orderTime}\n\n*Order Summary:* (ID: ...${details.orderIdShort})\n--------------------\n${details.itemsSummary}\n--------------------\n💰 *Total Amount: ₹${details.totalPrice}*\n\nReady for preparation. Thanks! 🙏☕`;
      console.log(`To: ${process.env.CATERER_WHATSAPP_NUMBER || "Not Set"}`);
      console.log(`Message:\n${simulatedMessage}`);
      console.log(`--- END WHATSAPP SIMULATION ---`);
    }
  },
};

module.exports = notificationService;
