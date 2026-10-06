import multer, { StorageEngine } from 'multer';
import mongoose from 'mongoose';
import { Request } from 'express';

/**
 * Custom GridFS storage engine for Multer.
 *
 * The unmaintained `multer-gridfs-storage` package is pinned to a
 * multer@1.x peer dependency, and multer 1.x carries disclosed
 * resource-exhaustion CVEs fixed only in 2.x. Rather than pull in a
 * vulnerable/abandoned dependency, this streams uploads directly into
 * MongoDB GridFS using Mongoose's own driver, and works with any
 * current multer version.
 */
class GridFsMulterStorage implements StorageEngine {
  private bucketName: string;

  constructor(options: { bucketName: string }) {
    this.bucketName = options.bucketName;
  }

  private getBucket(): mongoose.mongo.GridFSBucket {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection is not ready yet');
    }
    return new mongoose.mongo.GridFSBucket(db, { bucketName: this.bucketName });
  }

  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (error?: any, info?: Partial<Express.Multer.File> & { id?: mongoose.Types.ObjectId }) => void
  ): void {
    try {
      const bucket = this.getBucket();
      const filename = `${Date.now()}-${file.fieldname}-${file.originalname}`;

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          fieldname: file.fieldname,
          mimetype: file.mimetype,
        },
      });

      file.stream.pipe(uploadStream);

      uploadStream.on('error', (err) => cb(err));
      uploadStream.on('finish', () => {
        cb(null, {
          id: uploadStream.id as mongoose.Types.ObjectId,
          filename,
          size: uploadStream.length,
        });
      });
    } catch (err) {
      cb(err);
    }
  }

  _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void {
    try {
      const bucket = this.getBucket();
      const id = (file as any).id as mongoose.Types.ObjectId;
      bucket
        .delete(id)
        .then(() => cb(null))
        .catch((err) => cb(err));
    } catch (err) {
      cb(err as Error);
    }
  }
}

const storage = new GridFsMulterStorage({ bucketName: 'kycUploads' });

const kycUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WEBP, or PDF files are allowed'));
    }
    cb(null, true);
  },
});

export default kycUpload;
