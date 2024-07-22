import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist} from "../controllers/playlist.controller.js"

const router = new Router()
router.use(verifyJWT)

router.post("/", createPlaylist)
    
    router.get("/:playlistId", getPlaylistById)
    router.patch("/:playlistId", updatePlaylist)
    router.delete("/:playlistId", deletePlaylist)

router.patch("/add/:videoId/:playlistId", addVideoToPlaylist)
router.patch("/remove/:videoId/:playlistId", removeVideoFromPlaylist)

router.get("/user/:userId", getUserPlaylists)

export default router