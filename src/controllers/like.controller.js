
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const { videoId } = req.params;
    const userId = req.user._id;
    let isLiked = true

    try {
        // Check if the video exists
        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(400, "video not found in like section erroor")
        }

        // Check if the user has already liked the video
        let like = await Like.findOne({ video: videoId, likedBy: userId });

        if (like) {
            // If already liked, remove the like
            await like.remove();
            isLiked = false
            return res
            .status(200)
            .json (
                new ApiResponse(200, { isLiked: isLiked}, "unliked ")
            )          
        } 
            else {
            // If not liked, add the like
            await Like.create({ video: videoId, likedBy: userId });
            await like.save();
            return res
            .status(200)
            .json (
                new ApiResponse(200, { isLiked: isLiked}, "liked ")
            )       
        }
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "server error in like section erroor")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId  } = req.params;
    const userId = req.user._id;
    let isLiked = true

    try {
        // Check if the comment exists
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(400, "video not found in like section erroor")
        }

        // Check if the user has already liked the comment
        let like = await Like.findOne({ comment: commentId, likedBy: userId });

        if (like) {
            // If already liked, remove the like
            await like.remove();
            isLiked = false
            return res
            .status(200)
            .json (
                new ApiResponse(200, { isLiked: isLiked }, "unliked ")
            )          
        } 
            else {
            // If not liked, add the like
            await Like.create({ comment: commentId , likedBy: userId });
            await like.save();
            return res
            .status(200)
            .json (
                new ApiResponse(200, { isLiked: isLiked }, "liked ")
            )       
        }
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "server error in like section erroor")
    }
    //TODO: toggle like on comment

})



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;

    try {
        // Find all likes by the current user
        const likes = await Like.find({ likedBy: userId });

        // Extract video IDs from the likes
        const videoIds = likes.map(like => like.video);

        // Find all videos corresponding to the extracted video IDs
        const videos = await Video.find({ _id: { $in: videoIds } });
        if (!videos) {
            throw new ApiError(400, "no video found")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "all liked video fetched")
        );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "server error in likes")    }
})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}