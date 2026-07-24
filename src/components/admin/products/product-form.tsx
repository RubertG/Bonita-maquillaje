import { Button } from "@/components/common/button"
import { AnimatedCheckbox } from "@/components/common/animated-checkbox"
import { Save, Spinner } from "@/components/common/icons"
import clsx from "clsx"
import { AddTone } from "./add-tone"
import { Input, SelectInput, TextArea } from "@/components/common/input"
import { Category } from "@/types/db/db"
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form"
import { Inputs } from "@/types/admin/admin"
import { Tone as ToneType } from "@/types/db/db"
import { BaseSyntheticEvent } from "react"

interface Props {
  categories: Pick<Category, "name" | "id">[]
  error: string
  errors: FieldErrors<Inputs>
  register: UseFormRegister<Inputs>
  watch: UseFormWatch<Inputs>
  loading: boolean
  setTones: (tones: ToneType[]) => void
  tones: ToneType[]
  onSubmit: (e: BaseSyntheticEvent) => void
  defaultValues?: Partial<Inputs>
}

export const ProductForm = ({
  categories, error, errors, register, watch, loading, setTones, tones, onSubmit, defaultValues
}: Props) => {
  const price = watch("price") ?? 0
  const offerPrice = watch("offerPrice")
  const discount = offerPrice != null && offerPrice < price
    ? Math.round((1 - offerPrice / price) * 100)
    : null

  return (
    <form onSubmit={onSubmit}>
      <label
        className="text-text-100 mb-2 block"
        htmlFor="name">
        Nombre del producto <span className="text-accent-300">*</span>
      </label>
      <Input
        id="name"
        placeholder="Nombre del producto"
        {...register("name")}
      />
      {errors.name?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.name?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="category">
        Categoría <span className="text-accent-300">*</span>
      </label>
      <SelectInput
        title={categories.length === 0 ? "Cargando categorías..." : "Selecciona la categoría"}
        items={categories}
        id="category"
        placeholder="Categoría"
        defaultValue={defaultValues?.category ?? ""}
        {...register("category")}
      />
      {errors.category?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.category?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="description">
        Descripción <span className="text-accent-300">*</span>
      </label>
      <TextArea
        id="description"
        placeholder="Descripción"
        {...register("description")}
      />
      {errors.description?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.description?.message}</p>}

      <div className="mt-5 flex flex-col md:flex-row gap-4 md:gap-6">
        <AnimatedCheckbox
          label="Es más vendido"
          description="Entra en la sección de más vendidos"
          {...register("isBestSeller")}
          checked={watch("isBestSeller") ?? false}
          onChange={(e) => register("isBestSeller").onChange(e)}
          variant="primary"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
            </svg>
          }
        />
        <AnimatedCheckbox
          label="Es nuevo"
          description="Entra en la sección de nuevos"
          {...register("isNew")}
          checked={watch("isNew") ?? false}
          onChange={(e) => register("isNew").onChange(e)}
          variant="accent"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <path d="M3 12h18" />
              <path d="M5.6 5.6l12.8 12.8" />
              <path d="M18.4 5.6l-12.8 12.8" />
            </svg>
          }
        />
      </div>
      {(errors.isBestSeller?.message || errors.isNew?.message) && (
        <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">
          {errors.isBestSeller?.message || errors.isNew?.message}
        </p>
      )}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="price">
        Precio del producto <span className="text-accent-300">*</span>
      </label>
      <Input
        type="number"
        min={0}
        id="price"
        placeholder="0"
        {...register("price")}
      />
      {errors.price?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.price?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="offerPrice">
        Precio con descuento
      </label>
      <div className="relative">
        <Input
          type="number"
          id="offerPrice"
          min={0}
          placeholder="0"
          {...register("offerPrice")}
        />
        {discount != null && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-light text-text-100 bg-principal-100 px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>
      {errors.offerPrice?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.offerPrice?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="stock">
        Cantidad del producto <span className="text-accent-300">*</span>
      </label>
      <Input
        type="number"
        id="stock"
        min={0}
        placeholder="0"
        {...register("stock")}
      />
      {errors.stock?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.stock?.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="salesCount">
        Ventas
      </label>
      <Input
        type="number"
        id="salesCount"
        min={0}
        placeholder="0"
        {...register("salesCount")}
      />
      {errors.salesCount?.message && <p className="text-red-500 font-light px-3.5 mb-4 mt-2 text-sm">{errors.salesCount?.message}</p>}

      <AddTone
        setTones={setTones}
        tones={tones}
        className="mt-5 mb-1"
      />

      <Button
        className="w-full my-6"
      >
        <Save className="absolute top-1/2 -translate-y-1/2 left-0 ml-3.5 stroke-text-100" />
        <Spinner className={clsx("w-5 h-5 absolute opacity-0 transition-opacity", { "opacity-100": loading })} />
        <p className={clsx("transition-opacity", { "opacity-0": loading })}>Guardar producto</p>
      </Button>
      {error && <p className="text-red-500 font-light px-3.5 -mt-3 text-sm">{error}</p>}
    </form>
  )
}