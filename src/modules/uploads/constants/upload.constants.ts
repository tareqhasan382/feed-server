export const UPLOAD_FOLDERS = {
  AVATARS: 'avatars',
  POSTS: 'posts',
  COMMENTS: 'comments',
  COVERS: 'covers',
} as const;

export type UploadFolder =
  (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMimeType =
  (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
