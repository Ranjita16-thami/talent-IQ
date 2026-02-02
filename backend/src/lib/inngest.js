
Copy

import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { ENV } from "./env.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ 
  id: "talent-iq",
  eventKey: ENV.INNGEST_EVENT_KEY,
  signingKey: ENV.INNGEST_SIGNING_KEY 
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      await connectDB();
      
      console.log("Sync user function triggered:", JSON.stringify(event.data, null, 2));

      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        profile_image_url
      } = event.data;

      // Validate required data
      if (!id) {
        throw new Error("User ID is required");
      }

      const newUser = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        profileImage: image_url || profile_image_url || "",
      };

      console.log("Creating user with data:", newUser);

      await User.create(newUser);
      console.log("User created successfully in DB:", newUser.clerkId);

      // Sync to Stream Chat
      await upsertStreamUser({
        id: newUser.clerkId.toString(),
        name: newUser.name,
        email: newUser.email,
        image: newUser.profileImage,
      });

      console.log("User synced to Stream Chat successfully:", newUser.clerkId);
      
      return { success: true, userId: newUser.clerkId };
    } catch (error) {
      console.error("Error in syncUser function:", error);
      throw error;
    }
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();

      console.log("Delete user function triggered:", JSON.stringify(event.data, null, 2));

      const { id } = event.data;
      
      if (!id) {
        throw new Error("User ID is required for deletion");
      }

      // Delete from database
      await User.deleteOne({ clerkId: id });
      console.log("User deleted from DB:", id);

      // Delete from Stream Chat
      await deleteStreamUser(id.toString());
      console.log("User deleted from Stream Chat:", id);

      return { success: true, userId: id };
    } catch (error) {
      console.error("Error in deleteUserFromDB function:", error);
      throw error;
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];


