import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router'
import { ScoreBadge } from './ScoreBadge'
import type { Title, MyTitle } from '@/types/Title'

interface TitleGridCardProps {
  title: Title | MyTitle
  rank?: number
  hideRatedBadge?: boolean
}

export function TitleGridCard({ title, rank, hideRatedBadge }: TitleGridCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const navigate = useNavigate()

  const year = title.date ? new Date(title.date).getFullYear() : null
  const isRated = title.overallScore != null
  const isMovie = title.type.toLowerCase() === 'movie'
  const isTopRated = rank != null

  return (
    <button
      type="button"
      onClick={() => navigate('/rating', { state: { title } })}
      className={`group block w-full cursor-pointer rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
        isTopRated ? 'bg-linear-to-b from-gold/20 via-gold/5 to-transparent p-2' : ''
      }`}
    >
      <div
        className={`relative aspect-2/3 overflow-hidden rounded-2xl ring-1 transition-shadow ${
          isTopRated ? 'shadow-lg shadow-gold/20 ring-gold/60' : 'ring-ink/12 group-hover:shadow-md group-hover:shadow-ink/15'
        }`}
      >
        {imageFailed || !title.posterUrl ? (
          <div className="grid h-full w-full place-items-center bg-ink">
            <Icon icon="ph:film-slate" className="text-4xl text-paper/25" aria-hidden="true" />
          </div>
        ) : (
          <img
            src={title.posterUrl}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink via-ink/40 to-transparent" />

        <div
          className={`absolute bottom-2 left-2 flex h-8 items-center justify-center gap-1 rounded-lg bg-ink/80 text-paper/85 backdrop-blur-sm ${
            !isMovie && title.seasonsCount ? 'px-2.5' : 'w-8'
          }`}
        >
          <Icon icon={isMovie ? 'ph:film-slate' : 'ph:television-simple'} className="text-base" aria-hidden="true" />
          {!isMovie && title.seasonsCount ? (
            <span className="tabular-figs text-[0.65rem] font-semibold">
              {title.seasonsCount}
              <span className="sr-only"> seasons</span>
            </span>
          ) : null}
        </div>

        <div className="absolute right-2 top-2">
          <ScoreBadge score={title.overallScore} />
        </div>

        {!isMovie && title.completed != null && (
          <div className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-ink/80 backdrop-blur-sm">
            <Icon
              icon={title.completed ? 'ph:check-circle-fill' : 'ph:hourglass-medium-fill'}
              className={`text-base ${title.completed ? 'text-gold-soft' : 'text-paper/60'}`}
              aria-hidden="true"
            />
            <span className="sr-only">{title.completed ? 'Finished' : 'Still watching'}</span>
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {isTopRated && (
            <span className="tabular-figs flex items-center gap-1 rounded-lg bg-gold-soft px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink">
              <Icon icon="ph:crown-simple-fill" className="text-xs" aria-hidden="true" />
              <span className="sr-only">Ranked number </span>
              {rank}
            </span>
          )}
          {title.isOngoing && (
            <span className="flex items-center gap-1 rounded-lg bg-brand px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-paper">
              <Icon icon="ph:broadcast-fill" className="text-xs" aria-hidden="true" />
              On air
            </span>
          )}
          {isRated && !hideRatedBadge && (
            <span className="flex items-center gap-1 rounded-lg bg-ink/80 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold-soft backdrop-blur-sm">
              <Icon icon="ph:bookmark-simple-fill" className="text-xs" aria-hidden="true" />
              Rated
            </span>
          )}
        </div>
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="truncate text-sm font-bold text-ink">{title.name}</h3>
        <p className="truncate text-xs text-ink-soft">
          {year}
          {title.genres[0] ? ` · ${title.genres[0]}` : ''}
        </p>
      </div>
    </button>
  )
}