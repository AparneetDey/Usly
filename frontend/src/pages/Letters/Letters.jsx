import React, { useState, useEffect } from 'react';
import { Mail, Plus, Send, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Loader from '../../components/ui/Loader/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState/EmptyState.jsx';
import Toast from '../../components/ui/Toast/Toast.jsx';
import LetterCard from '../../components/letters/LetterCard.jsx';
import LetterDetailModal from '../../components/letters/LetterDetailModal.jsx';
import WriteLetterModal from '../../components/letters/WriteLetterModal.jsx';
import letterService from '../../services/letter.service.js';
import authService from '../../services/auth.service.js';
import styles from '../../components/letters/letters.module.css';

const Letters = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedLetters, setReceivedLetters] = useState([]);
  const [sentLetters, setSentLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [partner, setPartner] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const [rec, snt] = await Promise.all([
        letterService.getReceivedLetters(),
        letterService.getSentLetters(),
      ]);
      setReceivedLetters(rec || []);
      setSentLetters(snt || []);

      // Infer partner ID from received or sent letters, or current user context
      const sampleLetter = (rec || [])[0] || (snt || [])[0];
      if (sampleLetter) {
        const partnerInfo =
          sampleLetter.from?._id === user?._id
            ? sampleLetter.to
            : sampleLetter.from;
        if (partnerInfo) setPartner(partnerInfo);
      }
    } catch (err) {
      setToastMessage(err.message || 'Failed to fetch letters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleOpenLetterDetail = (letter) => {
    setSelectedLetter(letter);
    setIsDetailOpen(true);
  };

  const handleMarkAsOpened = async (letterId) => {
    try {
      await letterService.openLetter(letterId);
      fetchLetters();
    } catch (err) {
      console.error('Error marking letter as opened:', err);
    }
  };

  const handleSendLetter = async (letterData) => {
    setSubmitting(true);
    try {
      await letterService.createLetter(letterData);
      setToastMessage('Letter sent successfully! 💌');
      setIsWriteOpen(false);
      fetchLetters();
    } catch (err) {
      setToastMessage(err.message || 'Failed to send letter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLetter = async (letterId) => {
    if (!window.confirm('Delete this sent letter?')) return;
    try {
      await letterService.deleteLetter(letterId);
      setToastMessage('Letter deleted.');
      fetchLetters();
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete letter');
    }
  };

  const currentLetters = activeTab === 'received' ? receivedLetters : sentLetters;

  return (
    <PageContainer>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Private Letters 💌</h1>
          <p className={styles.subtitle}>Secret love notes and future messages just for us</p>
        </div>
        <Button variant="primary" onClick={() => setIsWriteOpen(true)}>
          <Plus size={18} />
          <span>Write a Letter</span>
        </Button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'received' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <Inbox size={16} />
          <span>Received ({receivedLetters.length})</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'sent' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <Send size={16} />
          <span>Sent ({sentLetters.length})</span>
        </button>
      </div>

      {loading ? (
        <Loader message="Gathering your letters..." />
      ) : currentLetters.length === 0 ? (
        <EmptyState
          icon="💌"
          title={activeTab === 'received' ? 'No letters received yet' : 'No sent letters'}
          description={
            activeTab === 'received'
              ? 'Maybe your partner is writing one right now?'
              : 'Write a sweet note or schedule a Valentine letter for your love.'
          }
          action={
            <Button variant="primary" size="sm" onClick={() => setIsWriteOpen(true)}>
              <Plus size={16} />
              <span>Write First Letter</span>
            </Button>
          }
        />
      ) : (
        <div className={styles.grid}>
          {currentLetters.map((letter) => (
            <LetterCard
              key={letter._id}
              letter={letter}
              isSent={activeTab === 'sent'}
              onClick={() => handleOpenLetterDetail(letter)}
              onDelete={handleDeleteLetter}
            />
          ))}
        </div>
      )}

      <LetterDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        letter={selectedLetter}
        onOpenLetter={activeTab === 'received' ? handleMarkAsOpened : undefined}
      />

      <WriteLetterModal
        isOpen={isWriteOpen}
        onClose={() => setIsWriteOpen(false)}
        onSend={handleSendLetter}
        partnerName={partner?.name}
        partnerId={partner?._id}
        loading={submitting}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default Letters;
