import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Camera, CircleExclamationPoint, ImagePlus, RefreshCw, Trash, Upload } from 'lucide-react'
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES } from '@/shared/lib/constants'
import { formatBytes } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { sizeLabel, validatePhoto } from '../validation'

export interface PhotoUploaderProps {
  value: File | null
  onChange: (file: File | null) => void
  maxBytes?: number
  accept?: readonly string[]
  disabled?: boolean
  error?: string | null
  uploading?: boolean
  progress?: number | null
  label?: string
}

export function PhotoUploader({
  value,
  onChange,
  maxBytes = MAX_PHOTO_BYTES,
  accept = ACCEPTED_PHOTO_TYPES,
  disabled = false,
  error,
  uploading = false,
  progress = null,
  label = 'Add a photo',
}: PhotoUploaderProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const shownError = localError ?? error ?? null
  const locked = disabled || uploading
  const maxLabel = sizeLabel(maxBytes)

  function take(file: File | undefined) {
    if (!file || locked) return
    const problem = validatePhoto(file, { maxBytes, accept })
    setLocalError(problem)
    if (!problem) onChange(file)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    take(event.target.files?.[0])
    event.target.value = ''
  }

  function onDragEnter(event: DragEvent) {
    event.preventDefault()
    if (locked) return
    dragDepth.current += 1
    setDragOver(true)
  }
  function onDragLeave(event: DragEvent) {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragOver(false)
  }
  function onDragOver(event: DragEvent) {
    event.preventDefault()
    event.dataTransfer.dropEffect = locked ? 'none' : 'copy'
  }
  function onDrop(event: DragEvent) {
    event.preventDefault()
    dragDepth.current = 0
    setDragOver(false)
    take(event.dataTransfer.files?.[0])
  }

  function remove() {
    setLocalError(null)
    onChange(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const describedBy = shownError ? `${errorId} ${hintId}` : hintId

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={accept.join(',')}
      className="sr-only"
      onChange={onInputChange}
      disabled={locked}
      aria-invalid={shownError ? true : undefined}
      aria-describedby={describedBy}
      tabIndex={value ? -1 : undefined}
    />
  )

  const dropHandlers = { onDragEnter, onDragLeave, onDragOver, onDrop }

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div {...dropHandlers} className="flex flex-col gap-3">
          {input}
          <div
            className={cn(
              'relative aspect-4/3 overflow-hidden rounded-panel border bg-sunken',
              dragOver ? 'border-action ring-3 ring-action-soft' : 'border-line',
            )}
          >
            <FilePreview file={value} />
            {uploading && <UploadOverlay progress={progress} />}
            {dragOver && !uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-action-soft/90 text-base font-semibold text-action-text backdrop-blur-xs">
                Drop to replace the photo
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <p className="min-w-0 flex-1 text-sm text-muted" id={hintId}>
              <span className="block truncate font-medium text-ink">{value.name}</span>
              <span className="tabular">{formatBytes(value.size)}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn--secondary btn--sm max-sm:h-11"
                onClick={() => inputRef.current?.click()}
                disabled={locked}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Replace
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm max-sm:h-11"
                onClick={remove}
                disabled={locked}
              >
                <Trash size={16} aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          {...dropHandlers}
          aria-disabled={locked || undefined}
          className={cn(
            'relative flex aspect-4/3 max-h-85 w-full flex-col items-center justify-center gap-4 rounded-panel border-2 border-dashed px-6 text-center transition-colors duration-150',
            'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-action',
            locked
              ? 'cursor-not-allowed border-line bg-sunken opacity-60'
              : dragOver
                ? 'cursor-copy border-action bg-action-soft'
                : shownError
                  ? 'cursor-pointer border-danger/60 bg-surface/50 hover:bg-surface/80'
                  : 'cursor-pointer border-line-strong bg-surface/50 hover:border-action/60 hover:bg-surface/80',
          )}
        >
          {input}
          <span
            aria-hidden="true"
            className={cn(
              'flex size-14 items-center justify-center rounded-full transition-colors duration-150',
              dragOver ? 'bg-action text-action-ink' : 'bg-action-soft text-action-text',
            )}
          >
            {dragOver ? <Upload size={24} /> : <Camera size={24} />}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-base font-semibold">{dragOver ? 'Drop to add the photo' : label}</span>
            <span className="text-sm text-muted">
              <span className="pointer-fine:hidden">Tap to take a photo or choose one</span>
              <span className="hidden pointer-fine:inline">Drag a photo here, or click to choose one</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-label text-muted" id={hintId}>
            <ImagePlus size={14} aria-hidden="true" />
            JPEG or PNG, up to {maxLabel}
          </span>
        </label>
      )}

      {shownError && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <CircleExclamationPoint size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{shownError}</span>
        </p>
      )}
    </div>
  )
}

function FilePreview({ file }: { file: File }) {
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (imgRef.current) imgRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])
  return <img ref={imgRef} alt="Preview of the chosen photo" className="size-full object-cover" />
}

function UploadOverlay({ progress }: { progress: number | null }) {
  return (
    <div
      className="absolute inset-x-3 bottom-3 flex flex-col gap-2 glass-strong rounded-control px-4 py-3"
      role="status"
    >
      <span className="text-sm font-medium tabular">{progress === null ? 'Uploading' : `Uploading ${progress}%`}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-neutral-soft">
        <span
          className="block h-full origin-left rounded-full bg-action transition-transform duration-200"
          style={{ transform: `scaleX(${(progress ?? 10) / 100})` }}
        />
      </span>
    </div>
  )
}
