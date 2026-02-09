
import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { err } from "inngest/types";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API KEY or SECRET is missing");
  throw new Error("Stream API credentials not configured");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);//will bw used chat features

export const upsertStreamUser = async (userData) => {
  try {
    const streamUser = {
      id: String(userData.id), // Ensure it's a string
      name: userData.name || 'User',
      image: userData.image,
    }
    const response = await chatClient.upsertUser(streamUser);
    console.log("Stream user upserted successfully:", userData);
    return response
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};