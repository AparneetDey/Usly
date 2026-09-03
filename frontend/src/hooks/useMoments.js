import { useState, useEffect, useCallback } from 'react';
import momentService from '../services/moment.service.js';

export const useMoments = () => {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMoments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await momentService.getActiveMoments();
      setMoments(data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch moments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  // Background Preloader: Preloads moment image & video media into browser memory as soon as Home page loads
  useEffect(() => {
    if (moments && moments.length > 0) {
      moments.forEach((m) => {
        if (m.media?.url) {
          if (m.media?.type === 'image') {
            const img = new Image();
            img.src = m.media.url;
          } else if (m.media?.type === 'video') {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.src = m.media.url;
          }
        }
      });
    }
  }, [moments]);

  const createMoment = async (momentData) => {
    const newMoment = await momentService.createMoment(momentData);
    await fetchMoments();
    return newMoment;
  };

  const deleteMoment = async (momentId) => {
    await momentService.deleteMoment(momentId);
    await fetchMoments();
  };

  const addReaction = async (momentId, reaction) => {
    const updated = await momentService.addReaction(momentId, reaction);
    setMoments((prev) => prev.map((m) => (m._id === momentId ? updated : m)));
    return updated;
  };

  const removeReaction = async (momentId) => {
    const updated = await momentService.removeReaction(momentId);
    setMoments((prev) => prev.map((m) => (m._id === momentId ? updated : m)));
    return updated;
  };

  const addComment = async (momentId, message) => {
    const updated = await momentService.addComment(momentId, message);
    setMoments((prev) => prev.map((m) => (m._id === momentId ? updated : m)));
    return updated;
  };

  const deleteComment = async (momentId, commentId) => {
    const updated = await momentService.deleteComment(momentId, commentId);
    setMoments((prev) => prev.map((m) => (m._id === momentId ? updated : m)));
    return updated;
  };

  return {
    moments,
    loading,
    error,
    refreshMoments: fetchMoments,
    createMoment,
    deleteMoment,
    addReaction,
    removeReaction,
    addComment,
    deleteComment,
  };
};

export default useMoments;
