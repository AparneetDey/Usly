import ImageKit from 'imagekit';

/**
 * Initializes and returns an ImageKit instance.
 * Validates that required environment variables exist.
 *
 * @returns {ImageKit} ImageKit SDK instance
 */
export const getImageKitInstance = () => {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      'ImageKit configuration error: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables must be configured.'
    );
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
};

export default getImageKitInstance;
