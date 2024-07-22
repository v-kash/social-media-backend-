
import {Comment} from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
   
        try {

            const comments = await Comment.find({ videoRef: videoId })
                .populate({
                    path: 'owner',
                    select: 'userName'
                })
                .populate({
                    path: 'video',
                    select: 'title'
                });
                if (!comments) {
                    throw new ApiError(400, "there are no comments on video")
                }
            return res
            .status(200)
            .json(200, comments, "comments fetched succesfully")
        } catch (error) {
            // Handle error
            console.error(error);
            throw new ApiError(500, "server eroor in comment section")
        }
    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    try {
        // Validate input data
        if (!content) {
            throw new ApiError(400, "comment can not be empty")       
         }

        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(400, "video not found ")       

         }

        // Create the comment
        const comment = new Comment({
            content,
            video: videoId,
            owner: req.user._id 
        });

        // Save the comment to the database
        await comment.save();

        return res
        .status(201)
        .json(
             new ApiResponse(200, comment, "comment added successfully")
             ); // Return the newly created comment
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "server eroor in comment section")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    try {
        // Find the comment by its ID
        let comment = await Comment.findById(commentId);

        // Check if the comment exists
        if (!comment) {
            throw new ApiError(400, "comment not found ")
        }

        // Check if the authenticated user is the owner of the comment (or has appropriate permissions)
        // Ensure that the comment can only be updated by its owner or authorized users
        if (!comment.owner.equals(req.user._id)) {
            throw new ApiError(400, "not a authorized user ")
        }

        // Update the comment content
        comment.content = content;
        
        // Save the updated comment
        await comment.save();

        return res
        .status(200)
        .json( 
            new ApiResponse(200, comment, "comment deleted")
        )

        res.json(comment); // Return the updated comment
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "server eroor in comment section")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    try {
        // Find the comment by ID
        const comment = await Comment.findById(commentId);

        // Check if the comment exists
        if (!comment) {
            throw new ApiError(400, "comment does not exists") 
        }

        // Check if the authenticated user is the owner of the comment (or has appropriate permissions)
        // Ensure that the comment can only be deleted by its owner or authorized users
        if (!comment.owner.equals(req.user._id)) {
            throw new ApiError(400, "you are not authorized to delete comment") 
        }

        // Remove the comment from the database
        await comment.remove();

        return res
        .status(200)
        .json( 
            new ApiResponse(200, comment, "comment deleted")
        )
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "server eroor in comment section")
    }

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }