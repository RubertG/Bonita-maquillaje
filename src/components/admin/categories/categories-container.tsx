"use client"

import { CategoryRow } from "./category-row"
import { SortableCategoryRow } from "./sortable-category-row"
import { useStoreCategory } from "@/stores/common/category.store"
import { Category } from "@/types/db/db"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import clsx from "clsx"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Props {
  className?: string
  initialCategories: Category[]
  editingId?: string
}

export const CategoriesContainer = ({ className, initialCategories, editingId }: Props) => {
  const categories = useStoreCategory(state => state.categories)
  const reordering = useStoreCategory(state => state.reordering)
  const reorderError = useStoreCategory(state => state.reorderError)
  const hydrateCategories = useStoreCategory(state => state.hydrateCategories)
  const reorderCategories = useStoreCategory(state => state.reorderCategories)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    hydrateCategories(initialCategories, false)
    setMounted(true)
  }, [hydrateCategories, initialCategories])

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

  const rows = mounted ? categories : initialCategories

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!active || !over || active.id === over.id) return

    const oldIndex = rows.findIndex(category => category.id === active.id)
    const newIndex = rows.findIndex(category => category.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    reorderCategories(arrayMove(rows, oldIndex, newIndex))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    reorderCategories(arrayMove(rows, index, index - 1))
  }

  const handleMoveDown = (index: number) => {
    if (index === rows.length - 1) return
    reorderCategories(arrayMove(rows, index, index + 1))
  }

  return (
    <div className={className}>
      <header className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3 mb-3">
        <p
          aria-live="polite"
          className={clsx("text-xs sm:text-sm font-light", reorderError ? "text-red-500" : "text-text-300")}
        >
          {
            reordering
              ? "Guardando orden…"
              : reorderError
                ? "No se pudo guardar el orden. Intenta de nuevo."
                : "Arrastra o usa las flechas: el orden se guarda al instante."
          }
        </p>
        {
          editingId && (
            <Link
              href="/admin/categorias"
              className="text-accent-300 lg:hover:text-principal-300 lg:transition-colors"
            >
              Cancelar edición
            </Link>
          )
        }
      </header>

      {
        rows.length === 0 ? (
          <p className="text-text-200 font-light text-center">
            Aún no hay categorías creadas.
          </p>
        ) : (
          <ul className="grid gap-3 max-w-2xl mx-auto">
            {
              mounted ? (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                >
                  <SortableContext
                    items={rows.map(category => category.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {
                      rows.map((category, index) => (
                        <SortableCategoryRow
                          key={category.id}
                          category={category}
                          position={index + 1}
                          total={rows.length}
                          disabled={reordering}
                          onMoveUp={() => handleMoveUp(index)}
                          onMoveDown={() => handleMoveDown(index)}
                        />
                      ))
                    }
                  </SortableContext>
                </DndContext>
              ) : (
                rows.map((category, index) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    position={index + 1}
                    total={rows.length}
                    disabled
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                  />
                ))
              )
            }
          </ul>
        )
      }
    </div>
  )
}
