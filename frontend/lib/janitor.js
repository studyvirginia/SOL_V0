import { db } from './db';

/**
 * Session Janitor: Manages the lifecycle of local data.
 * Mimics sessionStorage behavior for the heavy IndexedDB store.
 * Data survives page refreshes but is cleared when the tab/window is closed and reopened.
 */
export const runSessionJanitor = async () => {
  if (typeof window === 'undefined') return;

  const isSessionActive = sessionStorage.getItem('sol_session_active');

  if (!isSessionActive) {
    console.log("♻️ Session Janitor: New tab detected. Initializing storage context...");
    try {
      // We NO LONGER clear the database here. 
      // User sessions should persist across tabs/windows for a true 'Study History' experience.
      sessionStorage.setItem('sol_session_active', 'true');
    } catch (err) {
      console.error("Failed to initialize session context:", err);
    }
  } else {
    console.log("♻️ Session Janitor: Refresh detected. Persisting history.");
  }
};
