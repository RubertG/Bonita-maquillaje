"use client"

export const Footer = () => {
  return (
    <footer className="text-text-300 text-sm font-light max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
      <p>
        <span className="font-normal">© {new Date().getFullYear()} Bonita Maquillaje.</span> Todos los derechos
        reservados. 
      </p>
      <p>Desarrollado por <a href="https://www.web-minds-col.com/" target="_blank" rel="noopener noreferrer" className="font-normal lg:hover:underline">WebMinds Colombia</a></p>
    </footer>
  )
}