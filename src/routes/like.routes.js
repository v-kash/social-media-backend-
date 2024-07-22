import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {  toggleCommentLike,
    toggleVideoLike,
    getLikedVideos } from "../controllers/like.controller.js"


const router = new Router()
router.use(verifyJWT)


router.post("/toggle/v/:videoId",toggleVideoLike);
router.post("/toggle/c/:commentId", toggleCommentLike);
router.get("/videos", getLikedVideos);


export default router