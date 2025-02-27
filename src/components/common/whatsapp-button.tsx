"use client"

import { Link } from "next-view-transitions"
import { Whatsapp } from "./icons"
import { AnimatePresence, domAnimation, LazyMotion, m } from "motion/react"
import { useAutoHide } from "@/hooks/common/use-auto-hide"

const WhatsappButton = () => {
  const { show } = useAutoHide(4000)

  return (
    <LazyMotion features={domAnimation}>
      <Link
        href="https://api.whatsapp.com/send?phone=573137443132&text=Hola%21%20Maquillaje%20bonita"
        className="fixed bottom-4 right-4 z-30 flex items-center justify-end gap-1.5"
        target="_blank"
      >
        <AnimatePresence>
          {
            show && (
              <m.div
                className="bg-principal-200 py-1.5 px-6 rounded-full text-white"
                initial={{ opacity: 0, translateY: "20px" }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: "20px" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h3 className="font-bold text-sm">¿Necesitas ayuda?</h3>
                <p className="text-xs">
                  Escríbenos por Whatsapp
                </p>
              </m.div>
            )
          }
        </AnimatePresence>
        <div className="bg-principal-200 w-12 h-12 rounded-full flex items-center justify-center p-1.5 pl-[7px] pb-[6.5px] lg:hover:scale-110 lg:transition-transform">
          <Whatsapp className="stroke-white cursor-pointer w-full h-full" />
        </div>
      </Link>
    </LazyMotion>
  )
}

export default WhatsappButton
