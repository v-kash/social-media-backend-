import mongoose from "mongoose";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String,
        },

    },
    {
        timestamps: true
    }
)
         // pre method has access to the userschema object , and same goes for methods keyword for ispasswordcorrect
userSchema.pre("save", async function (next) {
            if(!this.isModified("password")) return next();
            this.password = await bcrypt.hash(this.password, 10)
            next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
           return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken =  function () {
            return jwt.sign(
                {
                    _id: this._id,
                    email: this.email,
                    userName: this.userName,
                    fullName: this.fullName
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                }

            )
}

///find the mistake i used async accidently
userSchema.methods.generateRefreshToken =  function () {
             return jwt.sign(
                {
                    _id: this._id
            
                },
                process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
                }

    )
}


export const User = mongoose.model("User", userSchema)