import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    profileImage:{
        type:String,
        default:"",
    },
    clerkId:{
        type: String,
        required: true,
        unique: true,
    },
},
{
    timestamps: true
} // createdAt,updatedAt in user // member since 2020 smth like that
) //create Schema 


const User = mongoose.model("User",userSchema) //create usermodel here User is model name and userSchema is we gone pass the name from userschema

export default User;