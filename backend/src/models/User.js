import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false, // ✅ Make email optional
      sparse: true,    // Allow multiple null values
    },
    name: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const User = mongoose.model("User", UserSchema);

export default User;