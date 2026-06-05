import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const ALLOWED = /jpeg|jpg|png|gif|pdf|webp|heic|svg/

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const mime = file.mimetype
    if (ALLOWED.test(ext) || mime.startsWith('image/') || mime === 'application/pdf') {
      cb(null, true)
    } else {
      cb(null, false) // reject silently instead of throwing error
    }
  }
})

export default upload
