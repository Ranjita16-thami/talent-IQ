
import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API KEY or SECRET is missing");
  throw new Error("Stream API credentials not configured");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.id) {
      throw new Error("User ID is required");
    }

    // Prepare user data for Stream
    const streamUser = {
      id: userData.id,
      name: userData.name || "User",
      ...(userData.email && { email: userData.email }),
      ...(userData.image && { image: userData.image }),
    };

    console.log("Upserting Stream user:", streamUser);

    await chatClient.upsertUser(streamUser);

    console.log("Stream user upserted successfully:", streamUser.id);
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log("Deleting Stream user:", userId);

    await chatClient.deleteUser(userId, {
      mark_messages_deleted: true,
      hard_delete: true,
    });

    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
    throw error;
  }
};

// Generate user token for client-side authentication
export const generateUserToken = (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const token = chatClient.createToken(userId);
    console.log("Generated token for user:", userId);

    return token;
  } catch (error) {
    console.error("Error generating user token:", error);
    throw error;
  }
};