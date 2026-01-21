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
  { event: "user.created" },  // Corrected: Clerk sends "user.created" not "clerk/user.created"
  async ({ event }) => {
    try {
      await connectDB();

      console.log("Sync user function triggered:", event.data); // Added logging

      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
      } = event.data;

      const newUser = {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(), // Added trim()
        profileImage: image_url,
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
  { event: "user.deleted" },  // Corrected: Clerk sends "user.deleted" not "clerk/user.deleted"
  async ({ event }) => {
    try {
      await connectDB();

      console.log("Delete user function triggered:", event.data.id); // Added logging

      await User.deleteOne({ clerkId: event.data.id });

      console.log("User deleted successfully:", event.data.id); // Added logging

      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error; // Re-throw to mark function as failed
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];