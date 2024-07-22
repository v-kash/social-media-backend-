import mongoose from "mongoose";

const likeSchema = mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        likedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
      
    },{ timestamps: true}
)

export const Like = mongoose.model("Like", likeSchema)