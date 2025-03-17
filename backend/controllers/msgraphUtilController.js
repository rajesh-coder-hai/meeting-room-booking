// Microsoft Graph API OAuth Token Function
const axios = require("axios");

// 🔎 **Search Users in Organization**
exports.searchUser = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query parameter is required" });

    try {
     
        const token = req.accessToken;
      
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName, '${query}') or startswith(mail, '${query}')`,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json",  ConsistencyLevel: "eventual",  } }
        );
        res.json(response.data.value);
    } catch (error) {
        console.error("Error searching users:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// 📅 **Create Meeting Event**
exports.createCalenderEvent = async (req, res) => {
    const { userId, subject, startDateTime, endDateTime, attendees } = req.body;
    if (!userId || !subject || !startDateTime || !endDateTime || !attendees) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const token = req.accessToken;
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/users/${userId}/events`,
            {
                subject,
                body: { contentType: "HTML", content: "Meeting room booking" },
                start: { dateTime: startDateTime, timeZone: "UTC" },
                end: { dateTime: endDateTime, timeZone: "UTC" },
                location: { displayName: "Santorini" },
                attendees: attendees.map(email => ({
                    emailAddress: { address: email, name: email },
                    type: "required",
                })),
            },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error creating meeting:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create meeting event" });
    }
};