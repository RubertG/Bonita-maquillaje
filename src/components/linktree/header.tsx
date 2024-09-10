interface Props {
  className?: string
}

export function Header({
  className
}: Props) {
  return (
    <header
      className={`${className} lg:flex lg:items-center lg:justify-center lg:gap-7 lg:mb-5`}
    >
      <img
        src="/logo.webp"
        alt="Logo de Bonita Maquillaje"
        title="Logo de Bonita Maquillaje"
        className="h-40 w-40 rounded-full shadow-logo m-auto lg:h-32 lg:w-32"
      />
      <section>
        <h1
          className="text-[2.5rem] text-text-50 text-center lg:text-left lg:text-[2.8rem]"
        >Bonita maquillaje</h1>
        <h2
          className="text-lg text-accent-300 text-center -m-1 lg:text-left lg:text-xl"
        >Más bonita que siempre</h2>
      </section>
    </header>
  )
}
