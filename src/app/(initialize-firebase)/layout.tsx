import React, { Suspense } from 'react'
import '@/firebase/initializeApp'
import { poppins } from '@/fonts/poppins/poppins'
import { Footer } from '@/components/common/footer'
import { ProductsAdminProvider } from '@/contexts/admin/products/products-context'
import { Spinner } from '@/components/common/icons'

function FirebaseLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={(
      <main
        className="flex min-h-dvh items-center justify-center py-10 px-4">
        <Spinner />
      </main>
    )}>
      <ProductsAdminProvider>
        <main className={`${poppins.className} min-h-[90vh]`}>
          {children}
        </main>
        <Footer />
      </ProductsAdminProvider>
    </Suspense>
  )
}

export default FirebaseLayout