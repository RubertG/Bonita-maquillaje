"use client"

import { useBannerAdmin } from "@/contexts/admin/banners/banners-context"
import { BannerRow } from "./banner-row"
import { DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface Props {
  className?: string
}

export const BannersContainer = ({ className }: Props) => {
  const { banners, reorderBanners, reordering } = useBannerAdmin()

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!active || !over || active.id === over.id) return

    const oldIndex = banners.findIndex(banner => banner.id === active.id)
    const newIndex = banners.findIndex(banner => banner.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    reorderBanners(arrayMove(banners, oldIndex, newIndex))
  }

  if (banners.length === 0) {
    return (
      <p className={`text-text-200 font-light text-center ${className}`}>
        Aún no hay banners creados.
      </p>
    )
  }

  return (
    <ul className={`grid gap-3 ${className}`}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={banners.map(banner => banner.id)}
          strategy={verticalListSortingStrategy}
        >
          {
            banners.map((banner) => (
              <BannerRow key={banner.id} banner={banner} disabled={reordering} />
            ))
          }
        </SortableContext>
      </DndContext>
    </ul>
  )
}
