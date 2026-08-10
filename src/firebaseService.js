/**
 * firebaseService.js
 *
 * Central module for all Firebase operations.
 * Import only what you need — tree-shaking keeps the bundle lean.
 *
 * Collections used:
 *   /contacts      — contact-form submissions
 *   /comments      — visitor comments on work
 *   /responses     — general user feedback / reactions
 *   /downloads     — tracks file download events
 *
 * Firebase Storage paths:
 *   /downloads/{filename}  — publicly downloadable files
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

import {
  ref,
  getDownloadURL,
  listAll,
} from 'firebase/storage';

import { db, storage, analytics } from './firebase';

// ── ANALYTICS ───────────────────────────────────────────────────────

/**
 * Log a custom analytics event.
 * @param {string} eventName
 * @param {Object} params
 */
export async function logEvent(eventName, params = {}) {
  try {
    const ga = await analytics;
    if (!ga) return;
    const { logEvent: _log } = await import('firebase/analytics');
    _log(ga, eventName, params);
  } catch (e) {
    console.warn('[Analytics]', e);
  }
}

// ── CONTACT FORM ─────────────────────────────────────────────────────

/**
 * Save a contact-form submission to Firestore.
 * @param {{ name: string, email: string, message: string }} data
 * @returns {Promise<string>} document ID
 */
export async function saveContact({ name, email, message }) {
  const docRef = await addDoc(collection(db, 'contacts'), {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });
  await logEvent('contact_form_submit', { name });
  return docRef.id;
}

// ── COMMENTS ─────────────────────────────────────────────────────────

/**
 * Post a visitor comment on a specific work item.
 * @param {{ workId: string, author: string, text: string }} data
 * @returns {Promise<string>} document ID
 */
export async function postComment({ workId, author, text }) {
  const docRef = await addDoc(collection(db, 'comments'), {
    workId,
    author,
    text,
    createdAt: serverTimestamp(),
  });
  await logEvent('comment_posted', { workId });
  return docRef.id;
}

/**
 * Fetch the latest comments for a work item.
 * @param {string} workId
 * @param {number} [max=20]
 * @returns {Promise<Array>}
 */
export async function getComments(workId, max = 20) {
  const q = query(
    collection(db, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((c) => c.workId === workId);
}

// ── USER RESPONSES / REACTIONS ────────────────────────────────────────

/**
 * Save a generic user response (e.g. poll answer, reaction, survey).
 * @param {{ type: string, value: any, page?: string }} data
 * @returns {Promise<string>} document ID
 */
export async function saveResponse({ type, value, page = '' }) {
  const docRef = await addDoc(collection(db, 'responses'), {
    type,
    value,
    page,
    createdAt: serverTimestamp(),
  });
  await logEvent('user_response', { type, page });
  return docRef.id;
}

// ── FILE DOWNLOADS (Firebase Storage) ────────────────────────────────

/**
 * Get the public download URL for a file in Storage.
 * Path convention: /downloads/{filename}
 * @param {string} filename   e.g. "LUTs-Pack.zip"
 * @returns {Promise<string>} presigned HTTPS URL
 */
export async function getFileDownloadURL(filename) {
  const fileRef = ref(storage, `downloads/${filename}`);
  const url = await getDownloadURL(fileRef);
  await logEvent('file_download', { filename });
  return url;
}

/**
 * List all available downloadable files in Storage.
 * @returns {Promise<string[]>} array of file names
 */
export async function listDownloadableFiles() {
  const folderRef = ref(storage, 'downloads');
  const result    = await listAll(folderRef);
  return result.items.map((item) => item.name);
}

/**
 * Trigger a browser download for a Storage file.
 * Creates a temporary <a> tag — no page navigation.
 * @param {string} filename
 */
export async function downloadFile(filename) {
  const url = await getFileDownloadURL(filename);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.target   = '_blank';
  a.rel      = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
