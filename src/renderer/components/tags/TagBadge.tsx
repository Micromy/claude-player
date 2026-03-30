import type { Tag } from '../../types'

interface Props {
  tag: Tag
  onRemove?: () => void
  small?: boolean
}

export function TagBadge({ tag, onRemove, small }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `${tag.color}33`,
        color: tag.color,
        border: `1px solid ${tag.color}66`
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-0.5"
          aria-label={`Remove tag ${tag.name}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </span>
  )
}
