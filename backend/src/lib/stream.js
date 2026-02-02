import { StreamChat } from "stream-chat"
import { ENV } from "./env.js"  // ✅ Added .js extension

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if (!apiKey || !apiSecret) {  // ✅ Fixed: apiKey not apikey
    console.error("Stream API KEY or SECRET_API_SECRET is missing")
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData)
        console.log("Stream user upserted successfully:", userData)
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
}

export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId, { mark_messages_deleted: true, hard_delete: true })
        console.log("Stream user deleted successfully:", userId)
    } catch (error) {
        console.error("Error deleting the Stream user:", error);
    }
}

// TODO: add another method to generate token