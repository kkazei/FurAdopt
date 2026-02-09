import express from "express";
import {
	getProfile,
	updateProfile,
	savePushSubscription,
	removePushSubscription,
	sendTestPush,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);
router.post("/push-subscribe", verifyToken, savePushSubscription);
router.post("/push-unsubscribe", verifyToken, removePushSubscription);
router.post("/push-test", verifyToken, sendTestPush);

export default router;
