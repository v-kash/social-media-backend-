import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudService.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if( [ title, description ].some( (field) => field?.trim() === "") )
        {
            throw new ApiError(400, "All fields are required")
        }

    const existVideo = await Video.findOne({title: title})

    if (existVideo) {
        throw new ApiError(409, "video with this title already exist")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "videoFile and thumbnail both required is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "videoFile and thumnail both required")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title,
        description: description,
        duration: videoFile.duration,
        owner: req.user?._id
    })
    const ownerName = req.user.userName

    return res
    .status(200)
    .json( 
        new ApiResponse(200, {video , ownerName}  , "successfully")
    )
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log(typeof(videoId))
    console.log(videoId)

    const video = await Video.find({_id: new mongoose.Types.ObjectId(videoId)})

    if (!video) {
       throw new ApiError(400, "video not found" ) 
    }

   return res.status(200).json( new ApiResponse(200, video, "found"))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {

    const { title, description , videoId} = req.body
    const thumbnailLocalPath = req.file?.path
   try {
 
     console.log(videoId)
     if (!thumbnailLocalPath) {
         throw new ApiError(400, "thumbnail required for updating ")
     }
     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
 
     if (!thumbnail || !title || !description) {
         throw new ApiError(400, " title, thumnail, description all 3 required to update")
     }
     const video = await Video.findByIdAndUpdate(
         videoId,
         {   $set: {
                 title: title,
                 description: description,
                 thumbnail: thumbnail.url
         }
         },
         {new: true}
     )
     if (!video) { 
         throw new ApiError(400, "video not found")
     }
     return res
         .status(200)
         .json(
             new ApiResponse(200, video ,"video updated")
         )
   } catch (error) {
    throw new ApiError(500, error.message)
   }

    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const deletedVideo = await Video.findByIdAndDelete(videoId)

        if (!deletedVideo) { 
            throw new ApiError(400, "video not found")
        }

    return res.status(200).json( new ApiResponse (200, "video deleted successfully"))

        
    } catch (error) {
        throw new ApiError(500, error?.message || "video not deleted, server error")
    }
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    try {
        const video = await Video.findById(videoId)
        
        if (!video) {
            throw new ApiError(400, "video not found")
        }

        video.isPublished = !video.isPublished
        await video.save()
        
        return res
        .status(200)
        .json(
            new ApiResponse(200, "ispublished toggeled")
        )
    } catch (error) {
        throw new ApiError(500, error?.message || " server error during changing publish status")
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}