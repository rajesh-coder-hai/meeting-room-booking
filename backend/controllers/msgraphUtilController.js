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
// exports.createCalenderEvent = async (req, res) => {
//     const { userId, subject, startDateTime, endDateTime, attendees } = req.body;
//     if (!userId || !subject || !startDateTime || !endDateTime || !attendees) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     try {
//         const token = req.accessToken;
//         const response = await axios.post(
//             `https://graph.microsoft.com/v1.0/users/${userId}/events`,
//             {
//                 subject,
//                 body: { contentType: "HTML", content: "Meeting room booking" },
//                 start: { dateTime: startDateTime, timeZone: "UTC" },
//                 end: { dateTime: endDateTime, timeZone: "UTC" },
//                 location: { displayName: "Santorini" },
//                 attendees: attendees.map(email => ({
//                     emailAddress: { address: email, name: email },
//                     type: "required",
//                 })),
//             },
//             { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//         );

//         res.json(response.data);
//     } catch (error) {
//         console.error("Error creating meeting:", error.response?.data || error.message);
//         res.status(500).json({ error: "Failed to create meeting event" });
//     }
// };

exports.createCalenderEvent = async (req, res) => {
    const { userId, subject, startDateTime, endDateTime, attendees } = req.body;
    if (!userId || !subject || !startDateTime || !endDateTime || !attendees) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const token = req.accessToken;

        // 1️⃣ Create the meeting in the organizer's calendar
        // const eventResponse = await axios.post(
        //     `https://graph.microsoft.com/v1.0/users/${userId}/events`,
        //     {
        //         subject,
        //         body: { contentType: "HTML", content: "Meeting room booking" },
        //         start: { dateTime: startDateTime, timeZone: "UTC" },
        //         end: { dateTime: endDateTime, timeZone: "UTC" },
        //         location: { displayName: "Santorini" },
        //         attendees: attendees.map(attendee => ({
        //             emailAddress: { address: attendee.email, name: attendee.email },
        //             type: "required",
        //         })),
        //     },
        //     { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        // );

        // console.log("✅ Meeting created successfully!");

      //  2️⃣ Get User IDs of Attendees
        const attendeeIds = await Promise.all(attendees.map(async (attendee) => {
            try {
                const userResponse = await axios.get(
                    `https://graph.microsoft.com/v1.0/users/${attendee.email}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                return { email: attendee.email, id: userResponse.data.id };
            } catch (error) {
                console.log(`⚠ Failed to fetch user ID for ${attendee.email}:`, error.response?.data || error.message);
                return null;
            }
        }));
console.log('attendeeIds',attendeeIds, userId);

        // Remove null values (users that couldn't be found)
        const validAttendees = attendeeIds.filter(user => user !== null);
        console.log('validAttendees',validAttendees);

        if (validAttendees.length === 0) {
            console.log("⚠ No valid attendees found. Skipping Teams message.");
            return res.json(eventResponse.data);
        }

        // 3️⃣ Send Message in Teams Chat for Each Attendee
        const message = `📅 **Meeting Invitation**\n\n📌 **Topic:** ${subject}\n🕒 **Time:** ${startDateTime} - ${endDateTime}\n📍 **Location:** Santorini`;

        for (const attendee of attendees) {
            try {
                let chatId = null;
        
                // Step 1️⃣: Get existing one-on-one chats
                const searchChatUrl = `https://graph.microsoft.com/v1.0/me/chats?$filter=chatType eq 'oneOnOne'`;
                const chatSearchResponse = await axios.get(searchChatUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                });
        console.log('chatSearchResponse',chatSearchResponse.data.value);
        
                if (chatSearchResponse.data.value.length > 0) {
                    for (const chat of chatSearchResponse.data.value) {
                        // Step 2️⃣: Check chat members for user and attendee
                        const membersUrl = `https://graph.microsoft.com/v1.0/chats/${chat.id}/members`;
        console.log('membersUrl',membersUrl.data.value);

                        const membersResponse = await axios.get(membersUrl, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
        
                        const members = membersResponse.data.value.map(m => m.userId);
                        if (members.includes(userId) && members.includes(attendee.id)) {
                            chatId = chat.id; // Found existing chat
                            console.log(`✅ Found existing chat with ${attendee.id}: ${chatId}`);
                            break;
                        }
                    }
                }
        
                // Step 3️⃣: If no chat exists, create a new one
                if (!chatId) {
                    console.log(`⚠️ No existing chat found with ${attendee.id}, creating a new one...`);
                    const chatResponse = await axios.post(
                        `https://graph.microsoft.com/v1.0/chats`,
                        {
                            chatType: "oneOnOne",
                            members: [
                                {
                                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                                    "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${userId}`
                                },
                                {
                                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                                    "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${attendee.id}`
                                }
                            ]
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
        
                    chatId = chatResponse.data.id;
                    console.log(`✅ Created new chat with ${attendee.id}: ${chatId}`);
                }
        
                // Step 4️⃣: Send message in the chat
                await axios.post(
                    `https://graph.microsoft.com/v1.0/chats/${chatId}/messages`,
                    {
                        body: { content: `📅 **Meeting Invitation**\n📌 **Topic:** ${subject}\n🕒 **Time:** 12:00PM - 12:30PM\n📍 **Location:** Santorini` }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
        
                console.log(`📨 Message sent to ${attendee.id}`);
        
            } catch (error) {
                console.error(`❌ Error sending message to ${attendee.id}:`, error.response?.data || error.message);
            }
        }
        
        

        // res.json(eventResponse.data);
        res.json({ message: "Meeting created successfully!" });
    } catch (error) {
        console.error("❌ Error creating meeting:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create meeting event" });
    }
};
