"use client"

import { FileStateItem } from "@/types/admin/admin"
import { ImgCard } from "./img-card"
import { OldImg } from "./old-img"
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface Props {
  className?: string
  images: Array<File | FileStateItem>
  handleDragEnd: (event: DragEndEvent) => void
  handleDelete: (item: File) => void
  aspect: string
  handleDeleteOld: (item: FileStateItem) => Promise<void>
}

export const ImagesContainer = ({
  className, images,
  handleDragEnd, handleDelete,
  aspect, handleDeleteOld
}: Props) => {
  return (
    <ul className={`grid gap-3 ${className}`}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map(item => `${item.name}-${item.size}`)}
          strategy={verticalListSortingStrategy}
        >
          {
            images.map((item, index) => {
              if (item instanceof File) {
                return <ImgCard key={index} item={item} handleDelete={handleDelete} aspect={aspect} />
              }
              return <OldImg key={index} item={item} handleDeleteOld={handleDeleteOld} aspect={aspect} />
            })
          }
        </SortableContext>
      </DndContext>
    </ul>
  )
}
