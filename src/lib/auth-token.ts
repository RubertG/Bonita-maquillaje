import { auth } from "@/firebase/initializeApp"

export async function getAuthToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) {
    throw new Error("No authenticated user")
  }
  return user.getIdToken()
}
