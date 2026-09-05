import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  MailIcon,
  ComplaintIcon,
  ImageIcon,
  HeartIcon,
  LockIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  MessageCircleIcon,
} from '../../components/icons/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Card from '../../components/ui/Card/Card.jsx';
import Badge from '../../components/ui/Badge/Badge.jsx';
import { SummaryCardSkeleton } from '../../components/ui/Skeleton/index.js';
import MomentsSection from '../../components/moments/MomentsSection.jsx';
import MissYouSection from '../../components/home/MissYouSection/MissYouSection.jsx';
import eventService from '../../services/event.service.js';
import letterService from '../../services/letter.service.js';
import complaintService from '../../services/complaint.service.js';
import styles from './Home.module.css';

const Home = () => {
  const { user, partner } = useAuth();

  const [greeting, setGreeting] = useState('');
  const [GreetingIconComp, setGreetingIconComp] = useState(() => SunIcon);

  const [nextEvent, setNextEvent] = useState(null);
  const [latestLetter, setLatestLetter] = useState(null);
  const [latestComplaint, setLatestComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic time-of-day greeting updater
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning');
        setGreetingIconComp(() => SunIcon);
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon');
        setGreetingIconComp(() => SunIcon);
      } else if (hour >= 17 && hour < 22) {
        setGreeting('Good evening');
        setGreetingIconComp(() => MoonIcon);
      } else {
        setGreeting('Good night');
        setGreetingIconComp(() => MoonIcon);
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, lettersData, complaintsData] = await Promise.all([
          eventService.getEvents().catch(() => []),
          letterService.getReceivedLetters().catch(() => []),
          complaintService.getComplaints().catch(() => []),
        ]);

        const now = new Date();
        const upcoming = (eventsData || []).find((e) => new Date(e.date) >= now);
        setNextEvent(upcoming || eventsData[0] || null);

        setLatestLetter((lettersData || [])[0] || null);
        setLatestComplaint((complaintsData || [])[0] || null);
      } catch (err) {
        console.error('Error fetching home summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <span>{greeting}, {user?.name || 'Love'}</span>
          <GreetingIconComp size={24} className="text-accent ml-2 inline-block" />
        </h1>
        <p className={styles.subgreeting}>
          {partner ? `Sharing moments with ${partner.name}` : '"Another day of us."'}
        </p>
      </div>

      <div className={styles.togetherBanner}>
        <div>
          <div className={styles.counterTitle}>Our Shared Journey</div>
          <div className={styles.counterValue}>
            {user?.name || 'You'} & {partner?.name || 'Partner'}
          </div>
        </div>
        <div className={styles.counterIcon}>
          <HeartIcon size={32} filled className="text-accent" />
        </div>
      </div>

      {/* 24-Hour Moments Feature Section */}
      <MomentsSection />

      {/* "I Miss You" Emotional Interaction */}
      <MissYouSection partner={partner} />

      {/* Summary Cards Grid */}
      <div className={styles.grid}>
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
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
                  <ArrowRightIcon size={12} />
                </Link>
              </div>
            </Card>

            {/* Latest Letter */}
            <Card hoverable className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <MailIcon size={18} className="text-primary" />
                  <span>Latest Letter</span>
                </div>
                {latestLetter?.isLocked && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-primary flex items-center gap-1">
                    <LockIcon size={12} />
                    <span>Locked</span>
                  </span>
                )}
              </div>
              <div className={styles.cardBody}>
                {latestLetter ? (
                  <div>
                    <h4 className="font-bold text-text text-base mb-1">{latestLetter.title}</h4>
                    <p className="text-xs text-muted mb-2">
                      From {latestLetter.from?.name || partner?.name || 'Partner'} • {formatDate(latestLetter.createdAt)}
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
                  <p className="text-muted text-sm">No letters received yet. Write one for {partner?.name || 'your love'}!</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <Link to="/letters" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  <span>Open Letters</span>
                  <ArrowRightIcon size={12} />
                </Link>
              </div>
            </Card>

            {/* Latest Complaint */}
            <Card hoverable className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <ComplaintIcon size={18} className="text-primary" />
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
                      <span className="text-xs text-primary font-semibold flex items-center gap-1">
                        <MessageCircleIcon size={14} />
                        <span>{latestComplaint.responses.length} response(s)</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-muted text-sm">All good! No active complaints at the moment.</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <Link to="/complaints" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  <span>Open Complaint Box</span>
                  <ArrowRightIcon size={12} />
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link to="/calendar" className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <CalendarIcon size={24} className="text-primary" />
            </span>
            <span className={styles.actionLabel}>Calendar</span>
          </Link>

          <Link to="/letters" className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <MailIcon size={24} className="text-primary" />
            </span>
            <span className={styles.actionLabel}>Write a Letter</span>
          </Link>

          <Link to="/complaints" className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <ComplaintIcon size={24} className="text-primary" />
            </span>
            <span className={styles.actionLabel}>Complaint Box</span>
          </Link>

          <div className={`${styles.actionCard} opacity-60 cursor-not-allowed`}>
            <span className={styles.actionIcon}>
              <ImageIcon size={24} className="text-primary" />
            </span>
            <span className={styles.actionLabel}>Memories (Soon)</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Home;
