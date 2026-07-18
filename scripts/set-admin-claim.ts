import { config } from "dotenv"
config({ path: ".env.local" })

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

function getAdminAuth() {
  const existingApp = getApps().at(0)
  const app = existingApp || initializeApp({
    credential: cert({
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: privateKey!
    }),
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET
  })
  return getAuth(app)
}

async function setAdminClaim(uid: string) {
  const auth = getAdminAuth()
  await auth.setCustomUserClaims(uid, { admin: true })
  console.log(`Admin claim set for user ${uid}`)
}

const uid = process.argv[2]
if (!uid) {
  console.error("Usage: tsx scripts/set-admin-claim.ts <uid>")
  process.exit(1)
}

setAdminClaim(uid).catch((error) => {
  console.error(error)
  process.exit(1)
})
