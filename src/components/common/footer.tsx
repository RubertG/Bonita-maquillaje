export const Footer = () => {
  return (
    <footer className="text-text-300 text-sm font-light max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
      <p>
        <span className="font-normal">© {new Date().getFullYear()} Bonita Maquillaje.</span> Todos los derechos
        reservados. 
      </p>
      <p>Desarrollado por <a href="https://github.com/rubertg" className="font-normal lg:hover:underline">Rubert Gonzalez</a></p>
    </footer>
  )
}