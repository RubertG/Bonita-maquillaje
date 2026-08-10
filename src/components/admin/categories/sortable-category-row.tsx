"use client"

import { CategoryRow } from "./category-row"
import { Category } from "@/types/db/db"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Props {
  category: Category
  position: number
  total: number
  disabled?: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

// Do NOT merge this into `CategoryRow`. The split exists because `useSortable`
// cannot be called conditionally: the container renders plain `CategoryRow`
// before `mounted` (where there is no `DndContext` ancestor for the hook to
// attach to) and `SortableCategoryRow` after. Calling the hook inside
// `CategoryRow` behind the `mounted` flag changes the hook-call count when the
// flag flips, which breaks the Rules of Hooks. `CategoryRow`'s optional
// handle/ref/style props exist only to receive this hook's output.

export const SortableCategoryRow = ({
  category,
  position,
  total,
  disabled = false,
  onMoveUp,
  onMoveDown
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <CategoryRow
      category={category}
      position={position}
      total={total}
      disabled={disabled}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      handleAttributes={attributes}
      handleListeners={listeners}
      innerRef={setNodeRef}
      style={style}
    />
  )
}
