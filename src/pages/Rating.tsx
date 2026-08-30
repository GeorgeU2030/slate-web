import { useEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useLocation, useNavigate } from 'react-router'
import { Icon } from '@iconify/react'
import { ScoreCategoryRow } from '@/components/rating/ScoreCategoryRow'
import { LiveScoreRing } from '@/components/rating/LiveScoreRing'
import { SettingToggle } from '@/components/rating/SettingToggle'
import { CommunityScoreBadge } from '@/components/rating/CommunityScoreBadge'
import { DeleteRatingDialog } from '@/components/rating/DeleteRatingDialog'
import { useUserTitleDetail, useRateTitle, useUpdateRating, useDeleteRating } from '@/hooks/useRating'
import { calculateScore } from '@/utils/scoreCalculator'
import { getScoreTier } from '@/utils/scoreColor'
import { resolveProviders } from '@/utils/streamingProviders'
import { GUTTER } from '@/utils/layout'
import type { Title, MyTitle } from '@/types/Title'
import type { RatingScores } from '@/types/Rating'

const CATEGORIES: {
  key: keyof RatingScores
  icon: string
  label: string
  description: string
  weight: number
}[] = [
  { key: 'storyScore', icon: 'ph:book-open-text', label: 'Story', description: 'Plot, pacing, and writing', weight: 30 },
  { key: 'directionScore', icon: 'ph:film-strip', label: 'Direction', description: 'Vision, tone, and craft behind the camera', weight: 20 },
  { key: 'actingScore', icon: 'ph:mask-happy', label: 'Acting', description: 'Performances that sell the story', weight: 20 },
  { key: 'technicalScore', icon: 'ph:sliders-horizontal', label: 'Technical', description: 'Cinematography, editing, sound, effects', weight: 15 },
  { key: 'impactScore', icon: 'ph:heart-straight', label: 'Impact', description: 'How much it stuck with you', weight: 15 },
]

const DEFAULT_SCORES: RatingScores = {
  storyScore: 5,
  actingScore: 5,
  directionScore: 5,
  technicalScore: 5,
  impactScore: 5,
}

const REVIEW_MAX = 1000

export function Rating() {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const title = location.state?.title as (Title | MyTitle) | undefined

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [scores, setScores] = useState<RatingScores>(DEFAULT_SCORES)
  const [review, setReview] = useState('')
  const [recommended, setRecommended] = useState(false)
  const [completed, setCompleted] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const isTv = title?.type.toLowerCase() === 'tv'
  const isEditMode = !!title?.userTitleId
  const { data: existing, isLoading: loadingExisting } = useUserTitleDetail(title?.userTitleId ?? undefined)

  const rateMutation = useRateTitle()
  const updateMutation = useUpdateRating(title?.userTitleId ?? '')
  const deleteMutation = useDeleteRating(title?.userTitleId ?? '')

  useEffect(() => {
    if (!existing) return
    setScores({
      storyScore: existing.storyScore,
      actingScore: existing.actingScore,
      directionScore: existing.directionScore,
      technicalScore: existing.technicalScore,
      impactScore: existing.impactScore,
    })
    setReview(existing.review ?? '')
    setRecommended(existing.recommended)
    setCompleted(existing.completed ?? true)
    setIsDirty(false)
  }, [existing])

  useEffect(() => {
    if (!isDirty || justSaved) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty, justSaved])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.rating-fade',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
        )
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [loadingExisting] }
  )

  const liveScore = useMemo(
    () =>
      calculateScore({
        story: scores.storyScore,
        acting: scores.actingScore,
        direction: scores.directionScore,
        technical: scores.technicalScore,
        impact: scores.impactScore,
      }),
    [scores]
  )

  const tier = getScoreTier(liveScore)

  if (!title) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <Icon icon="ph:warning-circle" className="text-4xl text-ink/30" aria-hidden="true" />
        <p className="text-ink-soft">No title was selected to rate.</p>
        <button onClick={() => navigate('/home')} className="btn btn-primary rounded-xl px-6">
          Back to Slate
        </button>
      </div>
    )
  }

  const updateScore = (key: keyof RatingScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const leave = () => {
    if (isDirty && !justSaved && !window.confirm('Leave without saving this rating?')) return
    navigate(-1)
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ ...scores, review, recommended, ...(isTv ? { completed } : {}) })
      } else {
        await rateMutation.mutateAsync({
          tmdbId: title.tmdbId,
          type: title.type.toLowerCase() as 'movie' | 'tv',
          ...scores,
          review,
          recommended,
          ...(isTv ? { completed } : {}),
        })
      }
      setJustSaved(true)
      setIsDirty(false)
      window.setTimeout(() => navigate('/home'), 900)
    } catch {
      setSubmitError('That rating didn’t save. Check your connection and try again.')
    }
  }

  const handleDelete = async () => {
    setSubmitError(null)
    try {
      await deleteMutation.mutateAsync()
      setIsDirty(false)
      navigate('/home')
    } catch {
      setConfirmingDelete(false)
      setSubmitError('That rating couldn’t be deleted. Try again.')
    }
  }

  const isSaving = rateMutation.isPending || updateMutation.isPending
  const providers = resolveProviders(title.watchProviders)
  const hasAbout = !!title.overview || title.productionCompanies.length > 0 || providers.length > 0

  const averageScore = existing?.averageScore ?? title.averageScore ?? null
  const ratingsCount = existing?.ratingsCount ?? title.ratingsCount ?? 0

  const saveLabel = justSaved
    ? 'Saved'
    : isSaving
      ? 'Saving…'
      : isEditMode
        ? 'Update rating'
        : 'Save rating'

  return (
    <div ref={ref} className="min-h-screen bg-paper pb-32 lg:pb-16">
      <nav className={`flex items-center py-5 ${GUTTER}`}>
        <button
          onClick={leave}
          className="-ml-1.5 flex items-center gap-0.5 rounded-lg py-1 pl-1 pr-2.5 text-[0.95rem] text-brand transition-colors hover:text-brand-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Icon icon="ph:caret-left-bold" className="text-lg" aria-hidden="true" />
          Back
        </button>
      </nav>

      <div className={GUTTER}>
        <header className="rating-fade relative overflow-hidden rounded-3xl bg-ink">
          {title.backdropUrl && (
            <img src={title.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/75 to-ink/40" />
          <div className="relative flex flex-wrap items-end justify-between gap-5 p-5 sm:p-8">
            <div className="flex items-end gap-4 sm:gap-5">
              <img
                src={title.posterUrl}
                alt=""
                className="h-28 w-19 shrink-0 rounded-xl object-cover shadow-lg shadow-ink/50 ring-1 ring-paper/15 sm:h-40 sm:w-28"
              />
              <div className="min-w-0 pb-1">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-gold-soft">
                  {isEditMode ? 'Editing your rating' : 'Rate this title'}
                </p>
                <h1 className="mt-1.5 font-display text-2xl font-medium tracking-tight text-paper sm:text-3xl">
                  {title.name}
                </h1>
                <p className="mt-1 text-sm text-paper/60">
                  {title.date ? new Date(title.date).getFullYear() : ''}
                  {title.genres[0] ? ` · ${title.genres[0]}` : ''}
                  {isTv && title.seasonsCount
                    ? ` · ${title.seasonsCount} season${title.seasonsCount === 1 ? '' : 's'}`
                    : ''}
                </p>
              </div>
            </div>

            {averageScore != null && (
              <CommunityScoreBadge averageScore={averageScore} ratingsCount={ratingsCount} />
            )}
          </div>
        </header>

        {hasAbout && (
          <section className="rating-fade mt-6 rounded-2xl border border-paper-line bg-paper-dim/40 p-5 sm:p-6">
            {title.overview && <p className="text-sm leading-relaxed text-ink-soft">{title.overview}</p>}

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-10">
              {title.productionCompanies.length > 0 && (
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink/40">Production</p>
                  <div className="mt-2 flex min-h-8 items-center">
                    <p className="text-sm text-ink/75">{title.productionCompanies.join(', ')}</p>
                  </div>
                </div>
              )}

              {providers.length > 0 && (
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink/40">Where to watch</p>
                  <div className="mt-2 flex min-h-8 flex-wrap items-center gap-2">
                    {providers.map((p) => (
                      <span
                        key={p.label}
                        className="badge h-8 gap-1.5 border-paper-line bg-paper px-3 text-xs text-ink/75"
                      >
                        <Icon icon={p.icon} className="text-sm" aria-hidden="true" />
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="rating-fade order-2 lg:order-1">
            <h2 className="font-display text-lg font-medium tracking-tight text-ink">Score each category</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Weighted into a single number - story and direction count most.
            </p>

            <div className="mt-2 divide-y divide-paper-line">
              {CATEGORIES.map((cat) => (
                <ScoreCategoryRow
                  key={cat.key}
                  icon={cat.icon}
                  label={cat.label}
                  description={cat.description}
                  weight={cat.weight}
                  value={scores[cat.key]}
                  onChange={(v) => updateScore(cat.key, v)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar sticks on desktop so the running score stays in view while scoring */}
          <aside className="rating-fade order-1 space-y-4 lg:order-2 lg:sticky lg:top-6">
            <div className="hidden flex-col items-center rounded-2xl bg-ink p-6 lg:flex">
              <LiveScoreRing score={liveScore} color={tier.color} tierLabel={tier.label} />
              <p className="mt-2 text-xs text-paper/50">Updates as you score</p>

              <button
                onClick={handleSubmit}
                disabled={isSaving || justSaved}
                className={`btn mt-5 h-12 min-h-0 w-full rounded-xl border-none font-semibold ${
                  justSaved ? 'btn-success' : 'bg-brand text-paper hover:bg-brand-bright'
                }`}
              >
                {isSaving && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
                {justSaved && <Icon icon="ph:check-bold" aria-hidden="true" />}
                {saveLabel}
              </button>
            </div>

            <SettingToggle
              icon="ph:thumbs-up"
              title="Recommend it"
              description="Would you tell a friend to watch this?"
              checked={recommended}
              onChange={(v) => {
                setRecommended(v)
                setIsDirty(true)
              }}
            />

            {isTv && (
              <SettingToggle
                icon="ph:check-circle"
                title="Finished the series"
                description="Turn this off if you haven't caught up yet"
                checked={completed}
                onChange={(v) => {
                  setCompleted(v)
                  setIsDirty(true)
                }}
              />
            )}

            <div className="rounded-2xl border border-paper-line bg-paper p-4">
              <label htmlFor="review" className="text-xs font-medium uppercase tracking-wide text-ink/55">
                Your review <span className="normal-case text-ink/35">(optional)</span>
              </label>
              <textarea
                id="review"
                value={review}
                maxLength={REVIEW_MAX}
                onChange={(e) => {
                  setReview(e.target.value)
                  setIsDirty(true)
                }}
                placeholder="What stood out to you?"
                rows={4}
                className="textarea mt-2 w-full resize-none rounded-xl border-ink/15 bg-paper text-sm text-ink placeholder:text-ink/30 focus:border-ink/35 focus:outline-2 focus:outline-offset-2 focus:outline-brand"
              />
              {review.length > REVIEW_MAX * 0.8 && (
                <p className="tabular-figs mt-1.5 text-right text-xs text-ink/45" aria-live="polite">
                  {REVIEW_MAX - review.length} characters left
                </p>
              )}
            </div>

            {isEditMode && (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="btn btn-ghost w-full rounded-xl text-sm text-ink/50 hover:bg-brand/10 hover:text-brand"
              >
                <Icon icon="ph:trash" className="text-base" aria-hidden="true" />
                Delete this rating
              </button>
            )}
          </aside>
        </div>

        {submitError && (
          <div role="alert" className="alert alert-error mt-6 rounded-xl border-brand/25 bg-brand/10 text-sm text-brand">
            <Icon icon="ph:warning-circle-fill" className="shrink-0 text-base" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-line bg-paper/95 backdrop-blur-md lg:hidden">
        <div className={`flex items-center gap-4 py-3 ${GUTTER}`}>
          <div className="flex items-center gap-3">
            <LiveScoreRing score={liveScore} color={tier.color} tierLabel={tier.label} size="sm" onDark={false} />
            <div className="leading-tight">
              <p className="text-xs text-ink-soft">Your score</p>
              <p className="text-sm font-bold" style={{ color: tier.color }}>
                {tier.label}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving || justSaved}
            className={`btn ml-auto h-12 min-h-0 flex-1 rounded-xl border-none px-6 font-semibold ${
              justSaved ? 'btn-success' : 'bg-brand text-paper'
            }`}
          >
            {isSaving && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
            {justSaved && <Icon icon="ph:check-bold" aria-hidden="true" />}
            {saveLabel}
          </button>
        </div>
      </div>

      <DeleteRatingDialog
        open={confirmingDelete}
        titleName={title.name}
        isDeleting={deleteMutation.isPending}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}