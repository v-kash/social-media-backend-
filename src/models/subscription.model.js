import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, //user who is suscribing
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //channel is user who has youtube channel
        ref: "User"
    }

}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)