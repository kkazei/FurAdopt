import multer from 'multer';
import * as cloudinaryModule from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';

// Configure Cloudinary
// Configure Cloudinary using the v2 API
cloudinaryModule.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log a non-sensitive startup notice so we know Cloudinary is wired
if (process.env.NODE_ENV !== 'test') {
    const name = process.env.CLOUDINARY_CLOUD_NAME || 'not-set';
    console.log(`[cloudinary] configured for cloud: ${name}`);
}

// Configure Cloudinary storage for multer
// Pass the root cloudinary instance (not v2) because the library accesses .v2 internally
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryModule,
    params: {
        folder: 'furadopt/pets',
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
    },
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
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

// Export v2 instance for controllers (uploader.destroy, etc.)
export const cloudinary = cloudinaryModule.v2;
export default upload;