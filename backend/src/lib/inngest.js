import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ 
  id: "talent-iq",
  signingKey: ENV.INNGEST_SIGNING_KEY 
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },  // Changed: added "clerk/" prefix with forward slash
  async ({ event }) => {
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
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },  // Changed: added "clerk/" prefix with forward slash
  async ({ event }) => {
    await connectDB();

    console.log("Delete user function triggered:", event.data.id); // Added logging

    await User.deleteOne({ clerkId: event.data.id });

    console.log("User deleted successfully:", event.data.id); // Added logging

    return { success: true };
  }
);

export const functions = [syncUser, deleteUserFromDB];