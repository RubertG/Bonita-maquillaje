"use client"

import { Share } from "../common/icons"

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  title: string
  url: string
  text: string
}

export const ButtonShare = ({
  text, title, url, ...props
}: Props) => {

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        url: url,
        text
      })
    } catch (error) {
      if (!window) return 

      window.location.href = `https://wa.me/?text=${text}%20${url}`
    }
  }

  return (
    <button
      onClick={handleShare}
      {...props}
    >
      <Share className="stroke-principal-200" />
    </button>
  )
}