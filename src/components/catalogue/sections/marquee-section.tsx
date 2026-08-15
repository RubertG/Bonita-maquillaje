import { Marquee } from "@/components/common/marquee"

interface Props {
  className?: string
}

const PHRASES = [
  "Realiza tu pedido agregando tus productos al carrito 🛒",
  "Llena tus datos 💌",
  "Confirma tu pedido y disponibilidad 📦",
  "Domicilios en Cúcuta y envíos nacionales 🚚"
]

export const MarqueeSection = ({ className }: Props) => (
  <Marquee items={PHRASES} className={className} />
)
