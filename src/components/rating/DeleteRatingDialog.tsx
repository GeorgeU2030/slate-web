import { useEffect, useRef } from 'react'

interface DeleteRatingDialogProps {
  open: boolean
  titleName: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteRatingDialog({
  open,
  titleName,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteRatingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      cancelRef.current?.focus()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} onCancel={onCancel} onClose={onCancel} className="modal">
      <div className="modal-box max-w-sm rounded-2xl border border-paper-line bg-paper text-ink">
        <h3 className="font-display text-lg font-medium">Delete this rating?</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Your scores and review for <span className="font-semibold text-ink">{titleName}</span> will
          be removed. This can’t be undone.
        </p>
        <div className="modal-action mt-6 gap-2">
          <button ref={cancelRef} onClick={onCancel} className="btn btn-ghost rounded-xl">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="btn btn-error rounded-xl text-paper">
            {isDeleting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
            {isDeleting ? 'Deleting…' : 'Delete rating'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  )
}