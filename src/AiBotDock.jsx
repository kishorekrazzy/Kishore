import { lazy, Suspense } from 'react';
import './AiBotDock.css';

/* The robot is three.js — lazy so it never lands in the first-load bundle. */
const RobotBot = lazy(() => import('./RobotBot'));

/* ══════════════════════════════════════════════════════════════════════
   AI BOT DOCK

   The 3D robot parked bottom-right, on nothing — transparent canvas, no
   panel, no backdrop. It watches the cursor, blinks, and its eyes turn to
   hearts when pressed. Clicking it opens the chat.

   Hover slides out the label; the robot itself stays put, because a 3D
   canvas that is mostly off-screen is wasted work and the robot is the
   part worth seeing.
   ══════════════════════════════════════════════════════════════════════ */

export default function AiBotDock({ onOpen }) {
  return (
    <div className="abd">
      <button className="abd-hit" onClick={onOpen} aria-label="Ask Kishore anything">
        <span className="abd-stage" aria-hidden="true">
          <Suspense fallback={null}>
            <RobotBot scale={1} pantallaColor="#00ffc6" pantallaBrillo={1.2} />
          </Suspense>
        </span>
        <span className="abd-label">Ask me anything</span>
      </button>
    </div>
  );
}
