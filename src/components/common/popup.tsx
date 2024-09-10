export const Popup = ({
  className = "",
  children
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <main className={`${className} z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-bg-300 bg-opacity-50 backdrop-blur-sm entry`}>
      {children}
    </main>
  )
}