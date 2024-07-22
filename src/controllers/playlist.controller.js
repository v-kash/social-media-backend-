import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    try {

        if (!name || !description) {
            throw new ApiError(400, "name and description both requried for play list")
        }

        const playlist = await Playlist.create({ name: name, description: description, userId: req.user?._id });

        if (!playlist) {
            throw new ApiError(400, "palylist not created")
        }

        res.
        status(201)
        .json(
            new ApiResponse(201, playlist, 'Playlist created successfully')
            );
    } catch (error) {
        console.error('Error:', error);
        throw new ApiError(500, 'Internal Server Error');
    }
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    try {
        const playlists = await Playlist.find({userId}).populate({
            path: "videos",
            populate: {
                    path: "owner",
                    model: "User",
                    select: "userName"
            }
        })

        if (!playlists || playlists.length === 0) {
            throw new ApiError(404, 'No playlists found for the user')
        }

        res
        .status(200)
        .json(
        new ApiResponse(200, playlists, 'User playlists retrieved successfully')
        );


    } catch (error) {
        console.error('Error:', error);
        throw new ApiError(500, 'Internal Server Error in getusersplalists');
    }
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    try {
          const  isPlaylistExists = await Playlist.findById(playlist)
          if (!isPlaylistExists) {
            throw new ApiError(400, "playlist does not exists")
          }

        const playlist = await Playlist.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(playlistId) }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $unwind: "$videos"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "videos.owner",
                    foreignField: "_id",
                    as: "videos.owner"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    description: { $first: "$description" },
                    videos: { $push: "$videos" }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    videos: {
                        _id: 1,
                        title: "$videos.title",
                        description: "$videos.description",
                        owner: { _id: "$videos.owner._id",
                                name: "$videos.owner.userName" }
                    }
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, playlists, 'User playlists retrieved successfully'));
    } catch (error) {
        console.error('Error:', error);
        throw new ApiError(500, 'eroor in getplaylist by id');
    }
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    try {
        const isVideoExistsInPlaylist = await Playlist.findOne({ _id: playlistId , videos: videoId})

        if (isVideoExistsInPlaylist) {
            throw new ApiError(400, "video already exists")
        }
        
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { videos: videoId } }, //add videoid to play list if video not exist already
            { new: true }
        );
        if (!updatedPlaylist) {
            throw new ApiError(404, 'Playlist not found');
        }
        res.
        status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, 'Video added to playlist successfully')
            );
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof mongoose.CastError) {
            throw new ApiError(400, 'Invalid Playlist ID or Video ID');
        }
        throw new ApiError(500, 'Internal Server Error');
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    try {

        const isVideoExistsInPlaylist = await Playlist.findOne({ _id: playlistId , videos: videoId})

        if (!isVideoExistsInPlaylist) {
            throw new ApiError(400, "video you try to remove from playlist does not exists in list")
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { videos: videoId } },
            { new: true }
        );
        if (!playlist) {
            throw new ApiError(404, 'Playlist not found');
        }
        res.status(200).json(new ApiResponse(200, playlist, 'Video removed from playlist successfully'));
    } catch (error) {
        console.error('Error:', error);
        throw new ApiError(500, 'Internal Server Error');
    }
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    try {
        const playlist = await Playlist.findByIdAndDelete(playlistId);
        if (!playlist) {
            throw new ApiError(404, 'Playlist not found');
        }
        res.
        status(200)
        .json(
            new ApiResponse(200, {}, 'Playlist deleted successfully')
            );
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof mongoose.CastError) {
            throw new ApiError(400, 'Invalid Playlist ID');
        }
        throw new ApiError(500, 'Internal Server Error');
    }
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    try {

        if (!name || !description) {
            throw new ApiError(400, "bro name and description both requiredto upadate playlist")
        }
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { name: name, description: description },
            { new: true }
        );
        if (!playlist) {
            throw new ApiError(404, 'Playlist not found');
        }
        res
        .status(200)
        .json(
            new ApiResponse(200, playlist, 'Playlist updated successfully')
            );

    } catch (error) {
        console.error('Error:', error);
        if (error instanceof mongoose.CastError) {
            throw new ApiError(400, 'Invalid Playlist ID');
        }
        throw new ApiError(500, 'Internal Server Error');
    }
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}