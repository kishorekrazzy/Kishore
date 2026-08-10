import { initializeApp } from 'firebase/app';
import { getFirestore }   from 'firebase/firestore';
import { getStorage }     from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

/* NOTE: this project replaced an earlier one (almosteditor-877de). Anything
   already written there — contact submissions, comments — stays there; it is
   not migrated. Everything from here on, including the CMS content document
   the admin dashboard edits, lives in resumenew-c1cb6.

   The apiKey below is not a secret. Firebase web keys identify the project,
   they do not authorise anything; access is decided entirely by the
   Firestore security rules. See ADMIN_SETUP.md for the rules this app
   expects — without them the content document is world-writable. */
const firebaseConfig = {
  apiKey:            'AIzaSyB5ycJV1MNggwr0wJ0ICFjc7hYDWMjtCP8',
  authDomain:        'resumenew-c1cb6.firebaseapp.com',
  projectId:         'resumenew-c1cb6',
  storageBucket:     'resumenew-c1cb6.firebasestorage.app',
  messagingSenderId: '649495525543',
  appId:             '1:649495525543:web:2f95c1d13e8f3990c34382',
  measurementId:     'G-4B2WY1XB3R',
};

export const app = initializeApp(firebaseConfig);

// Firestore — site content (CMS), contact submissions, comments, responses
export const db = getFirestore(app);

// Storage — hosts downloadable files (presets, assets, project files)
export const storage = getStorage(app);

// Analytics — only initialised in browsers that support it (blocks SSR/bots)
export const analytics = isSupported().then((yes) => yes ? getAnalytics(app) : null);
