// Microsoft Graph API OAuth Token Function
const axios = require("axios");
const handleApiError = require("../utils/errorHandler");

// 🔎 **Search Users in Organization**
exports.searchUser = async (req, res) => {
    const { query } = req.query;
    if (!query)
        return res.status(400).json({ error: "Query parameter is required" });

    try {
        const token = req.accessToken;

        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName, '${query}') or startswith(mail, '${query}')`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    ConsistencyLevel: "eventual",
                },
            }
        );
        res.json(response.data.value);
    } catch (error) {
        handleApiError(error, res, "Error searching users via Graph API");

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
                attendees: attendees.map((email) => ({
                    emailAddress: { address: email, name: email },
                    type: "required",
                })),
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("✅ Meeting created successfully!", response.data);
        return response.data;
        // res.json(response.data);
    } catch (error) {
        handleApiError(error, res, "Fail to create event via Graph API");
    }
};

exports.createCalenderEventWithBooking = async (body, res) => {
    console.log("createCalenderEventWithBooking", body);

    const { userId, subject, startDateTime, endDateTime, attendees, accessToken, location, isAllDay } =
        body;

    if (!userId || !subject || !startDateTime || !endDateTime || !attendees) {
        return {
            error: "Missing required fields",
        };
    }

    try {

        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/users/${userId}/events`,
            {
                subject,
                body: { contentType: "HTML", content: subject },
                start: { dateTime: new Date(startDateTime).toISOString(), timeZone: "UTC" },
                end: { dateTime: new Date(endDateTime).toISOString(), timeZone: "UTC" },
                location: { displayName: `${location}` },
                attendees: attendees.map((attendee) => ({
                    emailAddress: { address: attendee.email, name: attendee.displayName || attendee.id },
                    type: "required",
                })),
                isAllDay: isAllDay,
                isOnlineMeeting: true,            // Indicate you want an online meeting link
                onlineMeetingProvider: "teamsForBusiness" // Specify Microsoft Teams as the provider
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("✅ Meeting created successfully!", response.data);
        return response.data;
        // res.json(response.data);
    } catch (error) {
        handleApiError(error, res, "Failed to create meeting via Graph API");
    }
};