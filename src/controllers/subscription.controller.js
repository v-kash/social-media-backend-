import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    try {
        const pipeline = [
            {
                $match: { channel: mongoose.Types.ObjectId(channelId) }
            },
           

            {
                $addFields: {
                    isSubscribed:{
                        $cond:{
                            if: { $in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: { 
                    isSubscribed: 1
                    // Add other fields you want to retrieve from the subscriber details
                }
            }
        ];

        // Execute the aggregation pipeline
        const subscribers = await Subscription.aggregate(pipeline);

       return res
       .status(200)
       .json( 
        new ApiResponse(200, subscribers, "total no of  subscriber")
       );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error in subscription' });
    }
})
    
    // TODO: toggle subscription


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    try {
        const pipeline = [
            {
                $match: { channel: mongoose.Types.ObjectId(channelId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscribers"
                }
            },

            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    } 
                }
            },
            {
                $project: {
                     "subscribers._id": 1,
                     "subscribers.userName": 1,
                     "subscribers.email": 1,
                    subscribersCount: 1
                    // Add other fields you want to retrieve from the subscriber details
                }
            }
        ];

        // Execute the aggregation pipeline
        const subscribers = await Subscription.aggregate(pipeline);

       return res
       .status(200)
       .json( 
        new ApiResponse(200, subscribers, "total no of  subscriber")
       );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error in subscription' });
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    try {
        const pipeline = [
            {
                $match: { subscriber: mongoose.Types.ObjectId(subscriberId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "subscribedChannel"
                }
            },

            {
                $addFields: {
                    subscribedChannelCount: {
                        $size: "$subscribedChannel"
                    } 
                }
            },
            {
                $project: {
                     "subscribedChannel._id": 1,
                     "subscribedChannel.userName": 1,
                     "subscribedChannel.email": 1,
                    subscribedChannelCount: 1
                    // Add other fields you want to retrieve from the subscriber details
                }
            }
        ];

        // Execute the aggregation pipeline
        const subscribers = await Subscription.aggregate(pipeline);

       return res
       .status(200)
       .json( 
        new ApiResponse(200, subscribers, "total no of  subscriber")
       );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error in subscription' });
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}