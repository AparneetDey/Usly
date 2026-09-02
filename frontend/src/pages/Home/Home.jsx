import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Mail, AlertCircle, Image, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Card from '../../components/ui/Card/Card.jsx';
import Button from '../../components/ui/Button/Button.jsx';
import Badge from '../../components/ui/Badge/Badge.jsx';
import Loader from '../../components/ui/Loader/Loader.jsx';
import eventService from '../../services/event.service.js';
import letterService from '../../services/letter.service.js';
import complaintService from '../../services/complaint.service.js';
import styles from './Home.module.css';

const Home = () => {
  const { user } = useAuth();

  const [nextEvent, setNextEvent] = useState(null);
  const [latestLetter, setLatestLetter] = useState(null);
  const [latestComplaint, setLatestComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, lettersData, complaintsData] = await Promise.all([
          eventService.getEvents().catch(() => []),
          letterService.getReceivedLetters().catch(() => []),
          complaintService.getComplaints().catch(() => []),
        ]);

        // Find next upcoming event
        const now = new Date();
        const upcoming = (eventsData || []).find((e) => new Date(e.date) >= now);
        setNextEvent(upcoming || eventsData[0] || null);

        // Find latest letter
        setLatestLetter((lettersData || [])[0] || null);

        // Find latest complaint
        setLatestComplaint((complaintsData || [])[0] || null);
      } catch (err) {
        console.error('Error fetching home summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <PageContainer>
      <div className={styles.headerSection}>
        <h1 className={styles.greeting}>
          {getGreetingTime()}, {user?.name || 'Love'} ❤️
        </h1>
        <p className={styles.subgreeting}>"Another day of us."</p>
      </div>

      <div className={styles.togetherBanner}>
        <div>
          <div className={styles.counterTitle}>Our Shared Journey</div>
          <div className={styles.counterValue}>Usly space for two</div>
        </div>
        <div className={styles.counterIcon}>💖</div>
      </div>

      {loading ? (
        <Loader message="Gathering our memories..." />
      ) : (
        <div className={styles.grid}>
          {/* Next Special Day */}
          <Card hoverable className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <CalendarIcon size={18} className="text-primary" />
                <span>Next Special Day</span>
              </div>
              {nextEvent && <Badge type={nextEvent.type}>{nextEvent.type}</Badge>}
            </div>
            <div className={styles.cardBody}>
              {nextEvent ? (
                <div>
                  <h4 className="font-bold text-text text-base mb-1">{nextEvent.title}</h4>
                  <p className="text-sm text-muted mb-2">{formatDate(nextEvent.date)}</p>
                  {nextEvent.description && (
                    <p className="text-xs text-muted line-clamp-2">{nextEvent.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted text-sm">No upcoming events scheduled yet.</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Link to="/calendar" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                <span>View Calendar</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>

          {/* Latest Letter */}
          <Card hoverable className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Mail size={18} className="text-primary" />
                <span>Latest Letter</span>
              </div>
              {latestLetter?.isLocked && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-primary">
                  🔒 Locked
                </span>
              )}
            </div>
            <div className={styles.cardBody}>
              {latestLetter ? (
                <div>
                  <h4 className="font-bold text-text text-base mb-1">{latestLetter.title}</h4>
                  <p className="text-xs text-muted mb-2">
                    From {latestLetter.from?.name || 'Partner'} • {formatDate(latestLetter.createdAt)}
                  </p>
                  {latestLetter.isLocked ? (
                    <p className="text-xs italic text-muted">
                      "Opens on {formatDate(latestLetter.scheduledFor)}"
                    </p>
                  ) : (
                    <p className="text-xs text-muted line-clamp-2">{latestLetter.content}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted text-sm">No letters received yet. Write one for your love! 💌</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Link to="/letters" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                <span>Open Letters</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>

          {/* Latest Complaint */}
          <Card hoverable className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <AlertCircle size={18} className="text-primary" />
                <span>Complaint Box</span>
              </div>
              {latestComplaint && (
                <Badge type={latestComplaint.status}>{latestComplaint.status}</Badge>
              )}
            </div>
            <div className={styles.cardBody}>
              {latestComplaint ? (
                <div>
                  <h4 className="font-bold text-text text-base mb-1">{latestComplaint.title}</h4>
                  <p className="text-xs text-muted mb-2 line-clamp-2">{latestComplaint.description}</p>
                  {latestComplaint.responses?.length > 0 && (
                    <span className="text-xs text-primary font-semibold">
                      💬 {latestComplaint.responses.length} response(s)
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-muted text-sm">All good! No active complaints at the moment. 😇</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Link to="/complaints" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                <span>Open Complaint Box</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Action Navigation Buttons */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link to="/calendar" className={styles.actionCard}>
            <span className={styles.actionIcon}>📅</span>
            <span className={styles.actionLabel}>Calendar</span>
          </Link>

          <Link to="/letters" className={styles.actionCard}>
            <span className={styles.actionIcon}>💌</span>
            <span className={styles.actionLabel}>Write a Letter</span>
          </Link>

          <Link to="/complaints" className={styles.actionCard}>
            <span className={styles.actionIcon}>😭</span>
            <span className={styles.actionLabel}>Complaint Box</span>
          </Link>

          <div className={`${styles.actionCard} opacity-60 cursor-not-allowed`}>
            <span className={styles.actionIcon}>📸</span>
            <span className={styles.actionLabel}>Memories (Soon)</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Home;
