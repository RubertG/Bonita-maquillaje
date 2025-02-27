import { Toaster as SonnerToaster } from 'sonner'

const Toaster = () => {
  return (
    <SonnerToaster 
      position="bottom-left"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "bg-bg-50 border border-bg-100 text-text-200 rounded-lg px-3 py-3 flex flex-col items-center justify-between gap-2 w-full shadow shadow-lg text-center lg:text-left"
        }
      }}
    />
  )
}

export {Toaster}
