import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for resilient camera stream management, permissions, and front/back switching.
 * Supports both Photo capture (video: true, audio: false) and Video recording (video: true, audio: true).
 */
export const useCamera = ({ mode = 'photo' } = {}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isSwitchingRef = useRef(false);

  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [permissionState, setPermissionState] = useState('idle'); // 'idle' | 'granted' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameras, setCameras] = useState([]);

  // Completely stop all tracks on current stream and detach srcObject
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Enumerate video devices to detect multi-camera setups
  const checkMultipleCameras = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setCameras(videoInputs);
        setHasMultipleCameras(videoInputs.length > 1);
        return videoInputs;
      }
    } catch (err) {
      // ignore
    }
    return [];
  }, []);

  // Start or transition camera to a specific facingMode
  const startCamera = useCallback(
    async (targetFacing = 'user') => {
      stopCamera();
      setPermissionState('idle');
      setErrorMessage('');

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionState('error');
        setErrorMessage('Camera access is not supported in this browser environment.');
        return null;
      }

      const isVideoMode = mode === 'video';

      try {
        // Ideal facingMode constraint allows graceful fallback if a device only has one camera
        const constraints = {
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: isVideoMode, // microphone ONLY for video recording
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;
        setFacingMode(targetFacing);
        setPermissionState('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            // Auto-play was prevented or interrupted on rapid unmount
          }
        }

        // Query available devices after permissions are granted
        await checkMultipleCameras();

        return mediaStream;
      } catch (err) {
        console.error('[useCamera] getUserMedia error:', err);
        setPermissionState('denied');

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage(
            isVideoMode
              ? 'Camera and microphone access are required to record a video.'
              : 'Camera access is required to take a photo.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMessage('No camera device was found.');
        } else {
          setErrorMessage(err.message || 'Failed to access camera.');
        }
        return null;
      }
    },
    [mode, stopCamera, checkMultipleCameras]
  );

  // Switch camera: 1-click front <-> back with no stale state and async locking
  const switchCamera = useCallback(async () => {
    if (isSwitchingRef.current) return;
    isSwitchingRef.current = true;
    setIsSwitching(true);

    try {
      const nextFacing = facingMode === 'user' ? 'environment' : 'user';
      await startCamera(nextFacing);
    } finally {
      isSwitchingRef.current = false;
      setIsSwitching(false);
    }
  }, [facingMode, startCamera]);

  return {
    videoRef,
    streamRef,
    facingMode,
    permissionState,
    errorMessage,
    isSwitching,
    hasMultipleCameras,
    cameras,
    startCamera,
    stopCamera,
    switchCamera,
    checkMultipleCameras,
  };
};

export default useCamera;
