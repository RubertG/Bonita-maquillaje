import "server-only"

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

function initAdminApp() {
  const existingApp = getApps().at(0)
  if (existingApp) return existingApp

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin SDK credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local."
    )
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET
  })
}

const adminApp = initAdminApp()

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

export async function verifyAdminToken(idToken: string) {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing or invalid ID token")
  }

  const decoded = await adminAuth.verifyIdToken(idToken)

  if (decoded.admin !== true) {
    throw new Error("Forbidden: admin claim required")
  }

  return decoded
}
