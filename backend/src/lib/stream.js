import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API KEY or SECRET is missing");
  throw new Error("Stream API credentials not configured");
}

// Initialize the client
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    console.log("=== UPSERTING STREAM USER ===");
    console.log("Input data:", JSON.stringify(userData, null, 2));
    
    // Ensure all required fields are present
    const streamUser = {
      id: userData.id,
      name: userData.name || 'User',
      // Only include image if it exists and is a valid URL
      ...(userData.image && { image: userData.image }),
    };

    console.log("Formatted user for GetStream:", JSON.stringify(streamUser, null, 2));
    
    // The upsertUser call
    const response = await chatClient.upsertUser(streamUser);
    
    console.log("✅ Stream user upserted successfully!");
    console.log("Response:", JSON.stringify(response, null, 2));
    
    return response;
  } catch (error) {
    console.error("❌ Error upserting Stream user");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data || error);
    throw error;
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    console.log("Deleting Stream user:", userId);
    await chatClient.deleteUser(userId, { mark_messages_deleted: true });
    console.log("✅ Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("❌ Error deleting Stream user:", error);
    throw error;
  }
};