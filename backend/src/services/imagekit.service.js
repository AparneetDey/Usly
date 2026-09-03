import { getImageKitInstance } from '../config/imagekit.config.js';

class ImageKitService {
  /**
   * Safely deletes a file from ImageKit by fileId
   * @param {string} fileId - The ImageKit fileId to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteFile(fileId) {
    if (!fileId) {
      return { success: false, error: 'No fileId provided' };
    }

    try {
      const imagekit = getImageKitInstance();

      return new Promise((resolve) => {
        imagekit.deleteFile(fileId, (error, result) => {
          if (error) {
            console.error(`[ImageKitService] Failed to delete file ${fileId}:`, error.message || error);
            resolve({ success: false, error: error.message || 'ImageKit deletion failed' });
          } else {
            console.log(`[ImageKitService] File ${fileId} deleted successfully from ImageKit.`);
            resolve({ success: true, result });
          }
        });
      });
    } catch (error) {
      console.error(`[ImageKitService] Error in deleteFile(${fileId}):`, error.message);
      return { success: false, error: error.message };
    }
  }
}

export const imageKitService = new ImageKitService();
export default imageKitService;
