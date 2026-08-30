interface ProviderMatch {
  test: (provider: string) => boolean
  icon: string
  label: string
}

const PROVIDER_MATCHERS: ProviderMatch[] = [
  { test: (p) => /netflix/i.test(p), icon: 'mdi:netflix', label: 'Netflix' },
  { test: (p) => /prime video/i.test(p), icon: 'streamline-logos:amazon-prime-video-logo-1', label: 'Prime Video' },
  { test: (p) => /disney/i.test(p), icon: 'streamline-logos:disney-plus-logo-block', label: 'Disney+' },
  { test: (p) => /hbo/i.test(p), icon: 'simple-icons:hbo', label: 'HBO Max' },
  { test: (p) => /hulu/i.test(p), icon: 'simple-icons:hulu', label: 'Hulu' },
  { test: (p) => /paramount/i.test(p), icon: 'simple-icons:paramountplus', label: 'Paramount+' },
  { test: (p) => /crunchyroll/i.test(p), icon: 'simple-icons:crunchyroll', label: 'Crunchyroll' },
  { test: (p) => /apple tv/i.test(p), icon: 'simple-icons:appletv', label: 'Apple TV' },
  { test: (p) => /peacock/i.test(p), icon: 'simple-icons:peacock', label: 'Peacock' },
  { test: (p) => /mgm/i.test(p), icon: 'arcticons:mgm-plus', label: 'MGM+' },
]

export interface ResolvedProvider {
  icon: string
  label: string
}

export function resolveProviders(providers: string[]): ResolvedProvider[] {
  const seen = new Set<string>()
  const result: ResolvedProvider[] = []

  for (const provider of providers) {
    const match = PROVIDER_MATCHERS.find((m) => m.test(provider))
    if (match && !seen.has(match.label)) {
      seen.add(match.label)
      result.push(match)
    }
  }

  return result
}
