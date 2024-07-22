import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudService.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) =>
{
    try {
        const user = await User.findById(userId)
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
            //const newuser = await User.findByIdAndUpdate(
            // userId, 
            // { 
            //     $set:{
            //         refreshToken: refreshToken
            //     }
            // },
            // {new: true}
            // )
        
        user.refreshToken = refreshToken
        const newuser = await user.save({ validateBeforeSave: false })
    
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, error.message || "something went wrong in access and refresh token fn ")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    //get user details from frontend
    const { userName, fullName, email, password } = req.body
    console.log(req.files)

    //validation --field not empty
    if( [userName, fullName, email, password].some( (field) => field?.trim() === "") )
        {
            throw new ApiError(400, "All fields are required")
        }

    //check if user already exists: emailid user
    const existedUser = await User.findOne({
        $or: [{ userName },{ email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath)
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file required")
    }
    //upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(avatar)
    if (!avatar) {
         throw new ApiError(400, "Avatar file required")
     }

    // create user object -- creat enery in db
const user = await User.create({
    userName: userName.toLowerCase(), 
    fullName, 
    email, 
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
})
    //remove pass and refreshtoken from response
    // check for user creation 
    const createdUser = await User.findById(user._id).select( "-password -refreshToken" )
        if (!createdUser) { 
            throw new ApiError(500, "Something went wrong while using registering user")
        }
    // response
    return res.status(201).json( new ApiResponse(200, createdUser, "User registered Successfully"))

})

const loginUser = asyncHandler( async (req, res) => {
    //req body --> data
    const { userName, email, password } = req.body
    // username or email
    if (!(userName || email)) {
        throw new ApiError(400, "username or email is required")
    }
    //if user exist or not
    const user = await User.findOne({
        $or: [{userName}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }
    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(404, "invalid password !")
    }
    //access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //send cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    //console.log(refreshToken)

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json( 
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request from refresshtoken fn")
    }
    try {
        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "invalid refersh token  from refresshtoken fn") 
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "RefreshToken is Expired or used from refresshtoken fn")
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
        console.log(typeof(refreshToken))
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json( 
            new ApiResponse(
                200, 
                {
                accessToken, 
                refreshToken: refreshToken
                },
                "access token refreshed successfuly"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refreshtoken")
    }

})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const { oldPassword, newPassword } = req.body 

    const user = await User.findById(req.user?._id)
    const passwordCheck = await user.isPasswordCorrect(oldPassword)
    if (!passwordCheck) {
        throw new ApiError(400, "old password is wrong")
    }
    user.password = newPassword
   await user.save({ validateBeforeSave : false})

   return res
   .status(200)
   .json( new ApiResponse(200, {}, "password changed"))
})

const getCurrentUser = asyncHandler ( async (req, res) => {
    return res
    .status(200)
    .json( new ApiResponse(200, req.user, "current user fetched"))
})

const updateAccountDetails = asyncHandler ( async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "all fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "details upadated successfully"))
})

const updateUserAvatar = asyncHandler ( async (req, res) => {
    const avatarLocalPath  = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing try to re-upload")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Eroor while uploading file on cloud")
    }

    const  user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar upadated successfully"))
})

const updateUserCoverImage = asyncHandler ( async (req, res) => {
    const coverImageLocalPath  = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing try to re-upload")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Eroor while uploading coverimage file on cloud")
    }

    const  user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "coverimage upadated successfully"))
})

const getUserChannelProfile = asyncHandler ( async (req, res) => {
    const {userName}  = req.params
    console.log(req.params)
    console.log(typeof(req.params))
    console.log(typeof(userName))

    if (!userName?.trim()) {
        throw new ApiError(401, "username require or incorrect")
    }
    const channel= await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {     //gor getting suscriber
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {     //gor getting suscribed channel
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {         //  add new information
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToChannelCount:{
                    $size: "$subscribedTo"
                },
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
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                subscribedToChannelCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler ( async (req, res) => {
    const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup:{
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project:{
                                            fullName: 1,
                                            userName: 1,
                                            avatar: 1
                                        }
                                    }
                                ]

                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }

    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, " watch history fetched successfully")
    )
})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage ,
    getUserChannelProfile,
    getWatchHistory
}