import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CameraIcon,
  VideoIcon,
  CameraSwitchIcon,
  RotateCcwIcon,
  CheckIcon,
  CloseIcon,
  WarningIcon,
} from '../icons/index.js';
import Button from '../ui/Button/Button.jsx';
import useCamera from '../../hooks/useCamera.js';
import styles from './Moments.module.css';

const MAX_RECORDING_SECONDS = 30;

/**
 * In-Page Camera Capture & 30-Second Video Recorder Component
 * Supports photo capture (video: true, audio: false) and video recording (video: true, audio: true)
 * using native getUserMedia and MediaRecorder APIs.
 */
const CameraCapture = ({ mode = 'photo', onCapture, onCancel }) => {
  const {
    videoRef,
    streamRef,
    facingMode,
    permissionState,
    errorMessage,
    isSwitching,
    startCamera,
    stopCamera,
    switchCamera,
  } = useCamera({ mode });

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [reviewMedia, setReviewMedia] = useState(null); // { url, file, type, duration }

  // Stop MediaRecorder and timers safely
  const stopRecordingEngine = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
    setIsRecording(false);
  }, []);

  // Initialize camera stream when mode or review status changes
  useEffect(() => {
    if (reviewMedia) return;

    startCamera(facingMode);

    return () => {
      stopRecordingEngine();
      stopCamera();
    };
  }, [mode, reviewMedia, startCamera, stopCamera, stopRecordingEngine]);

  // Photo Capture Handler
  const handleTakePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;

    const videoEl = videoRef.current;
    const width = videoEl.videoWidth || 1280;
    const height = videoEl.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const objectUrl = URL.createObjectURL(file);

        stopCamera();
        setReviewMedia({
          url: objectUrl,
          file,
          type: 'image',
          duration: 0,
        });
      },
      'image/jpeg',
      0.92
    );
  };

  // Stop Video Recording & Process Blob
  const handleStopVideoRecording = useCallback(() => {
    stopRecordingEngine();

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    const actualDuration = Math.min(
      MAX_RECORDING_SECONDS,
      Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
    );

    mediaRecorder.onstop = () => {
      const chunks = recordedChunksRef.current;
      if (chunks.length === 0) return;

      const mimeType = chunks[0]?.type || mediaRecorder.mimeType || 'video/webm';
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `recorded_video_${Date.now()}.webm`, { type: mimeType });
      const objectUrl = URL.createObjectURL(file);

      stopCamera();
      setReviewMedia({
        url: objectUrl,
        file,
        type: 'video',
        duration: actualDuration,
      });
    };
  }, [stopRecordingEngine, stopCamera]);

  // Start Video Recording with 30s Hard Limit
  const handleStartVideoRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];

    const supportedMimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];

    let mimeType = '';
    if (typeof MediaRecorder !== 'undefined') {
      mimeType = supportedMimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
    }

    try {
      const mediaRecorder = new MediaRecorder(
        streamRef.current,
        mimeType ? { mimeType } : undefined
      );

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      startTimeRef.current = Date.now();
      setRecordingSeconds(0);
      setIsRecording(true);

      mediaRecorder.start(200);

      // 30-Second Hard Limit Timer
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed >= MAX_RECORDING_SECONDS) {
          setRecordingSeconds(MAX_RECORDING_SECONDS);
          handleStopVideoRecording();
        } else {
          setRecordingSeconds(Math.floor(elapsed));
        }
      }, 200);
    } catch (err) {
      console.error('[CameraCapture] Failed to start MediaRecorder:', err);
    }
  };

  // Retake photo or video
  const handleRetake = () => {
    if (reviewMedia?.url) {
      URL.revokeObjectURL(reviewMedia.url);
    }
    setReviewMedia(null);
    setRecordingSeconds(0);
    setIsRecording(false);
  };

  // Confirm capture and feed into main Moment creator pipeline
  const handleConfirmMedia = () => {
    if (reviewMedia) {
      onCapture(reviewMedia.file, reviewMedia.type, reviewMedia.duration);
    }
  };

  // Cancel and clean up camera tracks completely
  const handleCancelClick = () => {
    stopRecordingEngine();
    stopCamera();
    if (reviewMedia?.url) {
      URL.revokeObjectURL(reviewMedia.url);
    }
    onCancel();
  };

  const formatTimer = (secs) => {
    const s = Math.min(MAX_RECORDING_SECONDS, Math.max(0, secs));
    const pad = (n) => String(n).padStart(2, '0');
    return `00:${pad(s)} / 00:30`;
  };

  // Render Review Screen if photo/video is captured
  if (reviewMedia) {
    return (
      <div className="flex flex-col gap-3">
        <div className={styles.cameraFrame}>
          {reviewMedia.type === 'video' ? (
            <video src={reviewMedia.url} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <img src={reviewMedia.url} alt="Captured preview" className="w-full h-full object-contain" />
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button variant="ghost" onClick={handleRetake}>
            <RotateCcwIcon size={16} />
            <span>Retake</span>
          </Button>

          <Button variant="primary" onClick={handleConfirmMedia}>
            <CheckIcon size={16} />
            <span>Use {reviewMedia.type === 'video' ? 'Video' : 'Photo'}</span>
          </Button>
        </div>
      </div>
    );
  }

  // Render Permission Error Screen
  if (permissionState === 'denied' || permissionState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center gap-3 bg-surface-alt rounded-2xl border border-border">
        <WarningIcon size={40} className="text-highlight opacity-90" />
        <h4 className="font-bold text-text text-base">Camera Access Required</h4>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          {errorMessage || 'Please enable camera permissions in your browser settings.'}
        </p>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleCancelClick}>
            Back to Options
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Live Camera Viewfinder with conditional selfie horizontal mirror */}
      <div className={styles.cameraFrame}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? styles.mirrorVideo : ''}`}
        />

        {/* Recording Status & Timer Overlay */}
        {mode === 'video' && isRecording && (
          <div className={styles.recordingTimerBadge}>
            <span className={styles.recDot} />
            <span>{formatTimer(recordingSeconds)}</span>
          </div>
        )}

        {/* Top Right Action Overlay (Cancel / Close) */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={handleCancelClick}
            className={styles.cameraActionBtn}
            title="Cancel"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Bottom Right Action Overlay (Switch Camera) */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            type="button"
            onClick={switchCamera}
            disabled={isSwitching || isRecording}
            className={`${styles.cameraActionBtn} ${isSwitching ? 'cursor-wait opacity-60' : ''}`}
            title={
              isRecording
                ? 'Cannot switch camera while recording'
                : isSwitching
                ? 'Switching camera...'
                : `Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`
            }
          >
            <CameraSwitchIcon size={20} className={isSwitching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Camera Capture / Recording Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        {mode === 'photo' ? (
          <button
            type="button"
            onClick={handleTakePhoto}
            className={styles.shutterBtn}
            title="Take Photo"
          >
            <span className={styles.shutterInner} />
          </button>
        ) : (
          <div>
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartVideoRecording}
                className={styles.recordStartBtn}
                title="Start Recording"
              >
                <VideoIcon size={24} className="text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopVideoRecording}
                className={styles.recordStopBtn}
                title="Stop Recording"
              >
                <span className={styles.stopSquare} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
