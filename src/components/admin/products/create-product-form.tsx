"use client"

import { UploadFile } from "../common/upload-file"
import { useCreateProductForm } from "@/hooks/admin/products/use-create-product-form"
import { ProductForm } from "./product-form"

export const CreateProductForm = () => {
  const { errorImgs, imgs, setImgs, ...props } = useCreateProductForm()

  return (
    <section className="flex flex-col-reverse gap-4 max-w-lg mx-auto lg:grid lg:grid-cols-[55%_1fr] lg:gap-8 lg:max-w-none">
      <ProductForm {...props} />
      <aside>
        <UploadFile
          items={imgs}
          setItems={setImgs} />
        {(errorImgs) && <p className="text-red-500 font-light px-3.5 -mt-5 text-sm">{errorImgs}</p>}
      </aside>
    </section>
  )
}