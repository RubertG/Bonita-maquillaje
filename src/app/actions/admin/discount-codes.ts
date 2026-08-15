"use server"

import { Timestamp } from "firebase-admin/firestore"

import { verifyAdminToken, adminDb } from "@/firebase/server"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Id } from "@/types/db/db"

export interface CreateDiscountCodeInput {
  id: Id
  code: string
  discount: number
  expiration: string
  category: Id
}

type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createDiscountCode(
  token: string,
  input: CreateDiscountCodeInput
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)

    await adminDb
      .collection(ROUTES_COLLECTIONS.DISCOUNT_CODES)
      .doc(input.code)
      .set({
        id: input.id,
        code: input.code,
        discount: input.discount,
        expiration: Timestamp.fromDate(new Date(input.expiration)),
        category: input.category
      })

    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function deleteDiscountCode(
  token: string,
  id: Id
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await adminDb.collection(ROUTES_COLLECTIONS.DISCOUNT_CODES).doc(id).delete()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
