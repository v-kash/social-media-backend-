import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "20mb"}))
app.use(express.urlencoded({ extended: true, limit: "20mb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes imports
import userRoute from "./routes/user.routes.js"
import videoRoute from "./routes/video.routes.js"
import likeRoute from "./routes/like.routes.js"
import commentRoute from "./routes/comment.routes.js"
import playlistRoute from "./routes/playlist.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"
//route declaration


app.use("/api/v1/users", userRoute)
app.use("/api/v1/videos", videoRoute)
app.use("/api/v1/comments", commentRoute)
app.use("/api/v1/likes", likeRoute)
app.use("/api/v1/playlist", playlistRoute)
app.use("/api/v1/subscriptions", subscriptionRoute)

export default app 