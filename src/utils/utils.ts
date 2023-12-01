import {Request} from '@loopback/rest';
import {FileFilterCallback} from 'multer';
import path from 'node:path';
import {allowedFileTypes} from './constants';

export const getPublicMediaPath = (): string =>
  path.resolve(__dirname, '../../public/media');

export function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (!file) {
    throw new ReferenceError('The file was not provided.');
  }

  cb(null, allowedFileTypes.includes(file.mimetype));
}
