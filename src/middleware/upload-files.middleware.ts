import multer from 'multer';
import {fileFilter, getPublicMediaPath} from '../utils/utils';
import {ONE_BILLION, ONE_MEGABYTE} from './constants';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getPublicMediaPath());
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * ONE_BILLION,
    )}`;
    const [, extention] = file.mimetype.split('/');
    const fileName = `${file.fieldname}-${uniqueSuffix}.${extention}`;
    cb(null, fileName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fieldSize: ONE_MEGABYTE,
    fileSize: ONE_MEGABYTE,
  },
  fileFilter,
});
