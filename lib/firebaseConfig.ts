import { getFirebaseAuth, getFirebaseDb } from "./firebase";

// Export the Firebase instances for use in hooks
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
