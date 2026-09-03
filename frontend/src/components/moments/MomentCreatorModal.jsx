import React, { useState, useRef } from 'react';
import { ImageIcon, PlusIcon, CloseIcon } from '../icons/index.js';
import Modal from '../ui/Modal/Modal.jsx';
import Input from '../ui/Input/Input.jsx';
import Button from '../ui/Button/Button.jsx';
import uploadToImageKit from '../../services/imagekit.service.js';
import styles from './Moments.module.css';

const MomentCreatorModal = ({ isOpen, onClose, onCreate, loading: parentLoading }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [duration, setDuration] = useState(0);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setMediaType('image');
    setDuration(0);
    setCaption('');
    setError('');
    setUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      setError('Please select a valid image or video file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Media file size must be less than 25MB.');
      return;
    }

    const typeStr = isVideo ? 'video' : 'image';
    setMediaType(typeStr);
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (isVideo) {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        URL.revokeObjectURL(videoEl.src);
        if (videoEl.duration > 30.5) {
          setError('Videos must be 30 seconds or shorter.');
          setSelectedFile(null);
          setPreviewUrl('');
          return;
        }
        setDuration(Math.round(videoEl.duration));
      };
      videoEl.src = objectUrl;
    } else {
      setDuration(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo or video to share.');
      return;
    }

    setUploading(true);
    try {
      // Direct client upload to ImageKit folder: Home/Usly-Media/moments
      const uploadResult = await uploadToImageKit({
        file: selectedFile,
        fileName: `moment_${Date.now()}`,
        folder: 'Home/Usly-Media/moments',
      });

      await onCreate({
        media: {
          url: uploadResult.url,
          fileId: uploadResult.fileId,
          type: mediaType,
        },
        caption,
        duration,
      });

      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to upload moment media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share a Moment" maxWidth="500px">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-highlight/10 border border-highlight/30 rounded-lg text-highlight text-xs font-semibold">
            {error}
          </div>
        )}

        {!previewUrl ? (
          <div
            className={styles.mediaSelectArea}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <ImageIcon size={36} className="text-primary mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-text text-sm">Choose Photo or Video</h4>
            <p className="text-xs text-muted mt-1">
              Photos & videos stay visible for 24 hours.<br />
              Videos must be 30 seconds or shorter.
            </p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-black max-h-60 flex items-center justify-center">
            {mediaType === 'video' ? (
              <video src={previewUrl} controls className="max-h-60 w-full object-contain" />
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-60 w-full object-contain" />
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl('');
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
              title="Remove media"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}

        <Input
          label="Caption (Optional)"
          placeholder="Add a sweet note..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="ghost" onClick={handleClose} disabled={uploading || parentLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={uploading || parentLoading}
            disabled={!selectedFile}
          >
            <PlusIcon size={16} />
            <span>Share Moment</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MomentCreatorModal;
