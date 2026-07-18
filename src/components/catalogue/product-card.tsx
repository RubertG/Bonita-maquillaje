import { CatalogProduct } from "@/types/server/catalog"
import Image from "next/image"
import { Link } from "next-view-transitions"
import { domAnimation, LazyMotion } from "motion/react"
import * as m from "motion/react-m"
import { Photo } from "@/components/common/icons"

export const ProductCard = ({
  name,
  price,
  imgs,
  id,
  priority = false
}: Pick<CatalogProduct, "name" | "price" | "imgs" | "id"> & {
  priority?: boolean
}) => {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="lg:p-2.5 rounded-lg lg:hover:bg-bg-200 lg:hover:scale-105 cursor-pointer lg:transition-color"
        initial={{
          opacity: 0,
          translateY: "40px"
        }}
        whileInView={{
          opacity: 1,
          translateY: 0
        }}
        viewport={{
          amount: 0.4, 
          margin: "0px", 
          once: true 
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <Link href={`/catalogo/${id}`}>
          {imgs[0]?.url ? (
            <Image
              width={200}
              height={150}
              className="w-full aspect-[3/4] object-cover rounded-lg bg-bg-200"
              src={imgs[0].url}
              alt={`${name} - Bonita Maquillaje`}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-lg bg-bg-200 flex flex-col items-center justify-center gap-2 text-text-200">
              <Photo className="w-10 h-10" />
              <span className="text-sm">Sin imagen</span>
            </div>
          )}
          <footer className="mt-2 text-center">
            <h2 className="text-text-100 line-clamp-2">
              {name}
            </h2>
            <p className="text-accent-300 text-sm lg:text-base lg:-mt-0.5">
              ${price}
            </p>
          </footer>
        </Link>
      </m.div>
    </LazyMotion>
  )
}