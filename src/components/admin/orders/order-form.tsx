import { Button } from "@/components/common/button"
import { Save, Spinner } from "@/components/common/icons"
import { DiscountCodeInput, Input, SelectInput, TextArea } from "@/components/common/input"
import { PAYMENT_METHODS } from "@/consts/admin/orders"
import { InputsOrders } from "@/types/admin/admin"
import clsx from "clsx"
import { FieldErrors, UseFormRegister } from "react-hook-form"

interface Props {
  handleSubmit: () => Promise<void>
  loadingCode: boolean
  errorDiscountCode: string
  setErrorDiscountCode: (error: string) => void
  handleClickDiscountCode: (code: string) => void
  register: UseFormRegister<InputsOrders>
  errors: FieldErrors<InputsOrders>
  loading: boolean
  className?: string
  textButton?: string
}

export const OrderForm = ({
  handleSubmit,
  loadingCode,
  errorDiscountCode,
  setErrorDiscountCode,
  handleClickDiscountCode,
  register,
  errors,
  loading,
  className,
  textButton = "Guardar pedido"
}: Props) => {
  return (
    <form
      className={className}
      onSubmit={handleSubmit}>
      <label
        className="text-text-100 mb-2 block"
        htmlFor="discountCode">
        Código de descuento
      </label>
      <DiscountCodeInput
        id="discountCode"
        loading={loadingCode}
        setError={setErrorDiscountCode}
        onClickButton={handleClickDiscountCode}
        placeholder="Código de descuento"
      />
      {errorDiscountCode && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errorDiscountCode}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="name">
        Nombre y apellidos <span className="text-accent-300">*</span>
      </label>
      <Input
        id="name"
        placeholder="Pepito Perez"
        {...register("name")}
      />
      {errors.name?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.name.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="department">
        Departamento / estado <span className="text-accent-300">*</span>
      </label>
      <Input
        id="department"
        placeholder="Norte de Santander"
        {...register("department")}
      />
      {errors.department?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.department.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="city">
        Ciudad <span className="text-accent-300">*</span>
      </label>
      <Input
        id="city"
        placeholder="Cúcuta"
        {...register("city")}
      />
      {errors.city?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.city.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="address">
        Dirección de envío <span className="text-accent-300">*</span>
      </label>
      <TextArea
        id="address"
        className="-mb-2"
        placeholder="Ej: Carrera 3, casa 15, barrio El Centro"
        {...register("address")}
      />
      {errors.address?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.address.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="email">
        Email <span className="text-accent-300">*</span>
      </label>
      <Input
        id="email"
        placeholder="Correo del cliente"
        {...register("email")}
      />
      {errors.email?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.email.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="paymentMethod">
        Método de pago <span className="text-accent-300">*</span>
      </label>
      <SelectInput
        id="paymentMethod"
        title="Seleccionar método de pago"
        items={PAYMENT_METHODS.map(p => ({ name: p, id: p }))}
        {...register("paymentMethod")}
      />
      {errors.paymentMethod?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.paymentMethod.message}</p>}

      <label
        className="text-text-100 mb-2 block mt-5"
        htmlFor="phone">
        Número de celular <span className="text-accent-300">*</span>
      </label>
      <div className="flex gap-2">
        <Input
          className="max-w-16 text-center"
          value="+57"
          disabled
        />
        <Input
          id="phone"
          type="number"
          className="input-apparence-none"
          title="Seleccionar método de pago"
          placeholder="3137443132"
          {...register("phone")}
        />
      </div>
      {errors.phone?.message && <p className="text-red-500 font-light px-3.5 mt-2 text-sm">{errors.phone.message}</p>}

      <Button
        className="w-full my-6"
      >
        <Save className="absolute top-1/2 -translate-y-1/2 left-0 ml-3.5 stroke-text-100" />
        <Spinner className={clsx("w-5 h-5 absolute opacity-0 transition-opacity", { "opacity-100": loading })} />
        <p className={clsx("transition-opacity", { "opacity-0": loading })}>{textButton}</p>
      </Button>
    </form>
  )
}