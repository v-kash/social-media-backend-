import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels } from "../controllers/subscription.controller.js"


const router = new Router()
router.use(verifyJWT)


    router.get("/c/:channelId", getSubscribedChannels)
    router.post("/c/:channelId", toggleSubscription);

router.get("/u/:subscriberId", getUserChannelSubscribers);

export default router