import { motion } from 'framer-motion';
import './NotificationList.css';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Reel Uploaded',
    subtitle: '2026 showreel is now live',
    time: 'just now',
    count: 3,
  },
  {
    id: 2,
    title: 'Open to Work',
    subtitle: 'Freelance & full-time roles',
    time: '2m ago',
  },
  {
    id: 3,
    title: 'Profile Updated',
    subtitle: 'Skills & projects refreshed',
    time: 'Today',
  },
];

const SPRING = { type: 'spring', stiffness: 300, damping: 26 };
const TEXT_T  = { duration: 0.2, ease: 'easeInOut' };

function cardVariants(i) {
  return {
    collapsed: { marginTop: i === 0 ? 0 : -46, scaleX: 1 - i * 0.055 },
    expanded:  { marginTop: i === 0 ? 0 : 5,  scaleX: 1 },
  };
}

export function NotificationList({ onViewAll }) {
  const handleViewAll = (e) => {
    e.stopPropagation();
    onViewAll?.();
  };

  return (
    <motion.div
      className="nl-wrap"
      initial="collapsed"
      whileHover="expanded"
    >
      {/* Stacking cards */}
      <div className="nl-cards">
        {NOTIFICATIONS.map((n, i) => (
          <motion.div
            key={n.id}
            className="nl-card"
            variants={cardVariants(i)}
            transition={SPRING}
            style={{ zIndex: NOTIFICATIONS.length - i }}
          >
            <div className="nl-card-row">
              <span className="nl-title">{n.title}</span>
              {n.count != null && (
                <span className="nl-badge-count">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  {n.count}
                </span>
              )}
            </div>
            <div className="nl-card-sub">
              <span className="nl-time">{n.time}</span>
              <span className="nl-dot" aria-hidden="true">·</span>
              <span className="nl-subtitle">{n.subtitle}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="nl-footer">
        <div className="nl-count-badge">{NOTIFICATIONS.length}</div>
        <span className="nl-footer-label-wrap">
          <motion.span
            className="nl-footer-label"
            variants={{
              collapsed: { opacity: 1, y: 0,   pointerEvents: 'auto' },
              expanded:  { opacity: 0, y: -10, pointerEvents: 'none' },
            }}
            transition={TEXT_T}
          >
            Notifications
          </motion.span>
          <motion.span
            className="nl-footer-view"
            role="button"
            tabIndex={0}
            onClick={handleViewAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleViewAll(e);
              }
            }}
            variants={{
              collapsed: { opacity: 0, y: 10,  pointerEvents: 'none' },
              expanded:  { opacity: 1, y: 0,   pointerEvents: 'auto' },
            }}
            transition={TEXT_T}
            style={{ cursor: 'pointer' }}
          >
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
}
