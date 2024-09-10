import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage"
import { storage } from "../initializeApp"

export const saveFile = async (file: File, urlRef: string) => {
  const storageRef = ref(storage, `${urlRef}/${file.name}`)
  const fileRef = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(fileRef.ref)
  return downloadURL
}

export const deleteFile = async (urlRef: string) => {
  const storageRef = ref(storage, urlRef)
  await deleteObject(storageRef)
}