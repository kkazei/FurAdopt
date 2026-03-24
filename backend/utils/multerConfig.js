import multer from 'multer';
import * as cloudinaryModule from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from "dotenv";

dotenv.config();

const hasCloudinaryConfig = Boolean(
	process.env.CLOUDINARY_CLOUD_NAME &&
	process.env.CLOUDINARY_API_KEY &&
	process.env.CLOUDINARY_API_SECRET
);

// Configure Cloudinary
// Configure Cloudinary using the v2 API
if (hasCloudinaryConfig) {
	cloudinaryModule.v2.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});
} else {
	console.warn("Cloudinary keys are missing. Uploads are disabled.");
}

// Log a non-sensitive startup notice so we know Cloudinary is wired
if (process.env.NODE_ENV !== 'test') {
	const name = process.env.CLOUDINARY_CLOUD_NAME || 'not-set';
	console.log(`[cloudinary] configured for cloud: ${name}`);
}

// Configure Cloudinary storage for multer
// Pass the root cloudinary instance (not v2) because the library accesses .v2 internally
const storage = hasCloudinaryConfig
	? new CloudinaryStorage({
			cloudinary: cloudinaryModule,
			params: {
				folder: 'furadopt/pets',
				allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
			},
	  })
	: multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req, file, cb) => {
	if (!hasCloudinaryConfig) {
		cb(new Error("Image uploads are unavailable because Cloudinary is not configured."), false);
		return;
	}
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Only image files are allowed!'), false);
	}
};

// Configure multer with Cloudinary storage
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit per file
		files: 5 // Maximum 5 files
	},
	fileFilter: fileFilter
});

// Configure Cloudinary storage for profile pictures
const profilePictureStorage = hasCloudinaryConfig
	? new CloudinaryStorage({
			cloudinary: cloudinaryModule,
			params: {
				folder: 'furadopt/profiles',
				allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
				transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face', quality: 'auto' }],
			},
	  })
	: multer.memoryStorage();

// Configure multer for profile pictures (single file)
const profilePictureUpload = multer({
	storage: profilePictureStorage,
	limits: {
		fileSize: 3 * 1024 * 1024, // 3MB limit
	},
	fileFilter: fileFilter
});

// Export v2 instance for controllers (uploader.destroy, etc.)
export const cloudinary = cloudinaryModule.v2;
export default upload;
export { profilePictureUpload };
