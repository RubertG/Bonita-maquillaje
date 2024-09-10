"use client"

import { useEditProductForm } from "@/hooks/admin/products/use-edit-product-form"
import { UploadFile } from "../common/upload-file"
import { ProductForm } from "./product-form"

interface Props {
  className?: string
  id: string
}

export const EditProductForm = ({ className, id }: Props) => {
  const { errorImgs, imgs, setImgs, imgsOld, setImgsOld, ...props } = useEditProductForm({ id })

  return (
    <section className={`flex flex-col-reverse gap-4 max-w-lg mx-auto lg:grid lg:grid-cols-[55%_1fr] lg:gap-8 lg:max-w-none ${className}`}>
      <ProductForm {...props} />
      <aside>
        <UploadFile
          setImgsOld={setImgsOld}
          imgsOld={imgsOld}
          items={imgs}
          setItems={setImgs} />
        {(errorImgs) && <p className="text-red-500 font-light px-3.5 -mt-5 text-sm">{errorImgs}</p>}
      </aside>
    </section>
  )
}