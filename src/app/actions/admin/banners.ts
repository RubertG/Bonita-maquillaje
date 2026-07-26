"use server"

import { verifyAdminToken } from "@/firebase/server"
import {
  createBanner as createBannerServer,
  updateBanner as updateBannerServer,
  deleteBanner as deleteBannerServer,
  reorderBanners as reorderBannersServer,
  BannerOrder
} from "@/firebase/services/server/banners"
import { Banner, Id } from "@/types/db/db"

type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createBanner(
  token: string,
  banner: Banner
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await createBannerServer(banner)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function updateBanner(
  token: string,
  banner: Banner
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await updateBannerServer(banner)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function deleteBanner(
  token: string,
  id: Id
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await deleteBannerServer(id)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function reorderBanners(
  token: string,
  orders: BannerOrder[]
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await reorderBannersServer(orders)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
