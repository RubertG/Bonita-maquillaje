import { PurchaseReminder } from '@/components/catalogue/purchase-reminder'
import { Toaster } from '@/components/common/toaster'
import { PropsWithChildren } from 'react'

const LayoutCatalogue = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <Toaster />
      <PurchaseReminder />
    </>
  )
}

export default LayoutCatalogue
