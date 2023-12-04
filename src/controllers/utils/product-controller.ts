import path from 'node:path';
import fs from 'node:fs';
import {ProductMedia} from '../../models';
import {getPublicMediaPath} from '../../utils/utils';

export const getMediaPath = (filename: string): string => `/media/${filename}`;

export const productMediaFactory = (
  file?: Express.Multer.File,
): ProductMedia => ({
  filename: file?.filename ?? '',
  originalname: file?.originalname ?? '',
  size: file?.size ?? 0,
  path: file ? getMediaPath(file.filename) : '',
  createAt: file ? Date.now() : 0,
  updateAt: file ? Date.now() : 0,
});

export const updateProductImg = (
  media: ProductMedia,
  filename: string,
): ProductMedia => ({
  ...media,
  updateAt: Date.now(),
  filename,
  path: getMediaPath(filename),
});

export function deletePublicMediaByFilename(filename: string): boolean {
  const fullPath = path.resolve(
    __dirname,
    `${getPublicMediaPath()}/${filename}`,
  );

  try {
    fs.stat(fullPath, (error, stats) => {
      if (error) {
        throw error;
      }
      if (stats.isFile()) {
        fs.unlink(fullPath, err => {
          if (err) {
            throw err;
          }
        });
      }
    });
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
}

export function parseToBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  return false;
}
