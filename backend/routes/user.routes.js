import express from "express";
import {
	getProfile,
	updateProfile,
	uploadProfilePicture,
	savePushSubscription,
	removePushSubscription,
	sendTestPush,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { profilePictureUpload } from "../utils/multerConfig.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);
router.post("/profile-picture", verifyToken, profilePictureUpload.single("profilePicture"), uploadProfilePicture);
router.post("/push-subscribe", verifyToken, savePushSubscription);
router.post("/push-unsubscribe", verifyToken, removePushSubscription);
router.post("/push-test", verifyToken, sendTestPush);

export default router;
