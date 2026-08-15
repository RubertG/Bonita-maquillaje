export interface ImageDimensions {
  width: number
  height: number
}

export const readImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new window.Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("No se pudo leer el tamaño de la imagen"))
    }

    image.src = objectUrl
  })
}
