import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "../initializeApp"

export interface SavedFile {
  url: string
  name: string
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function normalizeFileName(id: string, originalName: string) {
  const timestamp = Date.now()
  const lastDotIndex = originalName.lastIndexOf(".")
  const base = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName
  const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex + 1) : ""
  const slug = slugify(base) || "file"
  const name = `${id}-${timestamp}-${slug}`
  return extension ? `${name}.${extension}` : name
}

export const saveFile = async (
  file: File,
  id: string,
  path: string
): Promise<SavedFile> => {
  const filename = normalizeFileName(id, file.name)
  const cleanPath = path.replace(/^\/+/, "").replace(/\/+$/, "")
  const fullPath = cleanPath ? `${cleanPath}/${filename}` : filename
  const storageRef = ref(storage, fullPath)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  return { url, name: filename }
}

export const deleteFile = async (path: string) => {
  const storageRef = ref(storage, path)
  try {
    await deleteObject(storageRef)
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === "storage/object-not-found") {
      return
    }
    throw error
  }
}
