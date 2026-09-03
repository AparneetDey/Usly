import authService from './auth.service.js';

export const uploadToImageKit = async ({ file, fileName, folder = 'Home/Usly-Media/avatars' }) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // 1. Fetch server-signed authentication parameters
  const authParams = await authService.getImageKitAuth();

  if (!authParams.token || !authParams.signature || !authParams.publicKey) {
    throw new Error('ImageKit authentication failed: missing credentials');
  }

  // 2. Prepare FormData payload for direct ImageKit upload API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName || file.name || `avatar_${Date.now()}`);
  formData.append('publicKey', authParams.publicKey);
  formData.append('signature', authParams.signature);
  formData.append('expire', authParams.expire);
  formData.append('token', authParams.token);
  formData.append('folder', folder);
  formData.append('useUniqueFileName', 'true');

  // 3. Post direct multipart form data to ImageKit API
  const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    throw new Error(errorData.message || 'ImageKit upload failed');
  }

  const uploadResult = await uploadResponse.json();

  return {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
    name: uploadResult.name,
  };
};

export default uploadToImageKit;
