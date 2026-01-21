import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ 
  id: "talent-iq",
  eventKey: ENV.INNGEST_EVENT_KEY,
  signingKey: ENV.INNGEST_SIGNING_KEY 
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  // Clerk emits "clerk/user.created" via webhooks; use exact match so runs trigger
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      await connectDB();

      console.log("Sync user function triggered:", event.data); // Added logging

      // event.data contains the user data object directly
      const userData = event.data;

      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
      } = userData;

      if (!id) {
        throw new Error("User ID is missing from webhook payload");
      }

      const newUser = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        profileImage: image_url || "",
      };

      await User.create(newUser);
      console.log("User created successfully:", newUser.clerkId); // Added logging
      
      return { success: true };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error; // Re-throw to mark function as failed
    }
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  // Clerk emits "clerk/user.deleted"; mismatch here prevents run logs from appearing
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();

      // event.data contains the user data object directly
      const userData = event.data;
      const userId = userData?.id;

      console.log("Delete user function triggered:", userId); // Added logging

      if (!userId) {
        throw new Error("User ID is missing from webhook payload");
      }

      await User.deleteOne({ clerkId: userId });

      console.log("User deleted successfully:", userId); // Added logging

      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error; // Re-throw to mark function as failed
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];