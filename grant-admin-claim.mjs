// Run this only from a trusted administrator workstation, never in Vercel or
// browser code. It uses Application Default Credentials (for example, the
// GOOGLE_APPLICATION_CREDENTIALS environment variable) and does not contain
// any credential material.
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const uid = process.argv[2];
if (!uid) {
  throw new Error("Usage: node scripts/grant-admin-claim.mjs <Firebase-Auth-UID>");
}

initializeApp({ credential: applicationDefault() });
await getAuth().setCustomUserClaims(uid, { admin: true });
console.log("Administrator claim assigned. Sign out and sign back in to refresh the token.");
