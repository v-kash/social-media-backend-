import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
 
const router = Router()
router.use(verifyJWT) //apply authentication every where

router.post("/upload", 
upload.fields([
        {
            name:  "videoFile",
            maxCount: 1
        },
        {
            name:  "thumbnail",
            maxCount: 1
        }
]) , 
publishAVideo)

router.get("/c/:videoId",getVideoById)
router.patch("/c/:videoId",togglePublishStatus)
router.delete("/c/:videoId",deleteVideo)
router.patch("/update",upload.single("thumbnail"),updateVideo)

export default router