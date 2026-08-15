import { PurchaseReminder } from "@/components/catalogue/purchase-reminder"
import { Toaster } from "@/components/common/toaster"
import { PropsWithChildren } from "react"

export default function CatalogLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster />
      <PurchaseReminder />
    </>
  )
}
