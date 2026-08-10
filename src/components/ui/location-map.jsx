import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import './location-map.css';

export function LocationMap({
  location = 'San Francisco, CA',
  coordinates = '37.7749° N, 122.4194° W',
  isExpanded = false,
  onExpandChange,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`lm-container ${className}`}
      style={{ perspective: 1000 }}
      layout
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onExpandChange?.(!isExpanded)}
    >
      <motion.div
        className="lm-card"
        layout
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Gradient sheen */}
        <div className="lm-gradient" />

        {/* Expanded video background */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="lm-expanded-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
            >
              <video
                className="lm-expanded-video"
                src="/large map.mp4"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
              />

              {/* Bottom fade so text is readable */}

            </motion.div>
          )}
        </AnimatePresence>

        {/* CCTV-style video thumbnail (collapsed only) */}
        <motion.div
          className="lm-thumb-wrap"
          animate={{ opacity: isExpanded ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
        >
          <video
            className="lm-thumb-video"
            src="/mini map.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

        </motion.div>

        {/* Content */}
        <div className="lm-content">
          {/* Top row */}
          <div className="lm-top">
            <motion.div animate={{ opacity: isExpanded ? 0 : 1 }} transition={{ duration: 0.22 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  filter: isHovered
                    ? 'drop-shadow(0 0 8px rgba(52,211,153,0.65))'
                    : 'drop-shadow(0 0 4px rgba(52,211,153,0.3))',
                  transition: 'filter 0.28s ease',
                }}>
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" x2="9" y1="3" y2="18" />
                <line x1="15" x2="15" y1="6" y2="21" />
              </svg>
            </motion.div>

            <motion.div className="lm-live-badge"
              animate={{ scale: isHovered ? 1.06 : 1 }}
              transition={{ duration: 0.18 }}
            >
              <div className="lm-live-dot" />
              <span className="lm-live-text">Live</span>
            </motion.div>
          </div>

          {/* Bottom text */}
          <div className="lm-bottom">
            <motion.h3 className="lm-location-name"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 25 }}
            >
              {location}
            </motion.h3>

            <AnimatePresence>
              {isExpanded && (
                <motion.p className="lm-coords"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {coordinates}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div className="lm-underline"
              animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Hint */}
      <motion.p className="lm-hint"
        animate={{
          opacity: isHovered && !isExpanded ? 1 : 0,
          y: isHovered ? 0 : 5,
        }}
        transition={{ duration: 0.18 }}
      >
        Click to expand
      </motion.p>
    </motion.div>
  );
}
