import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { ENV } from "./env.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({
  id: "talent-iq",
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      console.log("=== SYNC USER FUNCTION TRIGGERED ===");
      console.log("Full event:", JSON.stringify(event, null, 2));
      
      await connectDB();
      
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
      } = event.data;

      console.log("Extracted data:");
      console.log("- ID:", id);
      console.log("- Email:", email_addresses?.[0]?.email_address);
      console.log("- First name:", first_name);
      console.log("- Last name:", last_name);
      console.log("- Image URL:", image_url);

      // Validate required fields
      if (!id) {
        throw new Error("Missing Clerk user ID");
      }

      if (!email_addresses || email_addresses.length === 0) {
        throw new Error("Missing email addresses");
      }

      // Build user name
      const fullName = `${first_name || ""} ${last_name || ""}`.trim();
      const userName = fullName || email_addresses[0].email_address.split('@')[0];

      const newUser = {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: userName,
        profileImage: image_url,
      };

      console.log("Creating user in MongoDB:", newUser);
      await User.create(newUser);
      console.log("✅ User created in MongoDB");

      // Prepare GetStream user data
      const streamUserData = {
        id: id, // Use Clerk ID directly (e.g., "user_39QGjAQqzTFcCvabnzGyKOF9HaA")
        name: userName,
        image: image_url, // Use image_url directly from Clerk
      };

      console.log("Calling upsertStreamUser with:", streamUserData);
      const streamResult = await upsertStreamUser(streamUserData);
      console.log("✅ GetStream upsert completed:", streamResult);

      console.log("=== SYNC USER COMPLETED SUCCESSFULLY ===");
      return { 
        success: true, 
        userId: id,
        streamResult 
      };

    } catch (error) {
      console.error("=== SYNC USER FAILED ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error; // Re-throw to mark function as failed in Inngest
    }
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      console.log("=== DELETE USER FUNCTION TRIGGERED ===");
      await connectDB();
      
      const { id } = event.data;
      console.log("Deleting user:", id);
      
      await User.deleteOne({ clerkId: id });
      console.log("✅ User deleted from MongoDB");
      
      await deleteStreamUser(id);
      console.log("✅ User deleted from GetStream");
      
      return { success: true, userId: id };
    } catch (error) {
      console.error("=== DELETE USER FAILED ===");
      console.error("Error:", error);
      throw error;
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];