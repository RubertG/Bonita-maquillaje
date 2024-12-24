import { Link } from "next-view-transitions"
import { Whatsapp } from "./icons"

const WhatsappButton = () => {
  return (
    <Link
      href="https://api.whatsapp.com/send?phone=573137443132&text=Hola%21%20Maquillaje%20bonita"
      className="fixed bottom-4 right-4 z-50 lg:hover:scale-110 lg:transition-transform"
      target="_blank"
    >
      <Whatsapp className="w-11 h-11 p-1.5 bg-principal-200 stroke-white rounded-full cursor-pointer" />
    </Link>
  )
}

export default WhatsappButton
