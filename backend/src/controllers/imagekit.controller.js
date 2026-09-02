import { getImageKitInstance } from '../config/imagekit.config.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

/**
 * @desc    Get ImageKit client-side upload authentication parameters (token, expire, signature, publicKey, urlEndpoint)
 * @route   GET /api/imagekit/auth
 * @access  Private
 */
export const getImageKitAuth = asyncHandler(async (req, res) => {
  try {
    const imagekit = getImageKitInstance();

    // Generate server-side authentication parameters (token, expire, signature) using private key
    const authParams = imagekit.getAuthenticationParameters();

    const responseData = {
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    };

    res.status(200).json(
      new ApiResponse(
        200,
        responseData,
        'ImageKit authentication generated successfully'
      )
    );
  } catch (error) {
    if (error.message && error.message.includes('ImageKit configuration error')) {
      throw new ApiError(500, error.message);
    }
    throw new ApiError(
      500,
      'Failed to generate ImageKit authentication parameters'
    );
  }
});
