import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export interface Entry {
  id: string
  category: string
  minutes: number
  /** Local calendar day, formatted as YYYY-MM-DD. */
  date: string
}

interface PersistedState {
  categories: string[]
  entries: Entry[]
}

const STORAGE_KEY = 'fokus-habits'

/** Local-date ISO string (YYYY-MM-DD) for `today + offset` days. */
export function dayOffset(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

function seed(): PersistedState {
  return {
    categories: ['Meditation', 'Kung Fu', 'Dehnen & Kraft', 'Joggen & Kraft'],
    entries: [
      { id: createId(), category: 'Kung Fu', minutes: 60, date: dayOffset(0) },
      { id: createId(), category: 'Meditation', minutes: 10, date: dayOffset(0) },
      { id: createId(), category: 'Dehnen & Kraft', minutes: 25, date: dayOffset(-1) },
      { id: createId(), category: 'Kung Fu', minutes: 30, date: dayOffset(-3) },
    ],
  }
}

function load(): PersistedState {
  if (typeof localStorage === 'undefined') return seed()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seed()
  try {
    const parsed = JSON.parse(raw) as PersistedState
    if (Array.isArray(parsed.categories) && Array.isArray(parsed.entries)) {
      return parsed
    }
  } catch {
    // fall through to seed
  }
  return seed()
}

export const useHabitsStore = defineStore('habits', () => {
  const initial = load()
  const categories = ref<string[]>(initial.categories)
  const entries = ref<Entry[]>(initial.entries)

  // Persist any change so the tracker survives reloads.
  watch(
    [categories, entries],
    ([cats, ents]) => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: cats, entries: ents }))
    },
    { deep: true },
  )

  const minutesToday = computed(() =>
    entries.value
      .filter((e) => e.date === dayOffset(0))
      .reduce((sum, e) => sum + e.minutes, 0),
  )

  /** Entries grouped by day, most recent first, with a display label per group. */
  const entriesByDay = computed(() => {
    const groups = new Map<string, Entry[]>()
    for (const entry of entries.value) {
      const list = groups.get(entry.date) ?? []
      list.push(entry)
      groups.set(entry.date, list)
    }
    return [...groups.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({ date, label: dayLabel(date), items }))
  })

  function entryCount(category: string): number {
    return entries.value.filter((e) => e.category === category).length
  }

  function addEntry(entry: Omit<Entry, 'id'>): void {
    entries.value.push({ id: createId(), ...entry })
  }

  function addCategory(name: string): void {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.value.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return
    categories.value.push(trimmed)
  }

  return {
    categories,
    entries,
    minutesToday,
    entriesByDay,
    entryCount,
    addEntry,
    addCategory,
  }
})

/** German, uppercased label for a group: HEUTE / GESTERN / full date. */
function dayLabel(date: string): string {
  if (date === dayOffset(0)) return 'HEUTE'
  if (date === dayOffset(-1)) return 'GESTERN'
  return formatFullDate(date).toUpperCase()
}

/** e.g. "Donnerstag, 2. Juli" */
export function formatFullDate(date: string): string {
  const parts = date.split('-')
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])
  const dt = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(dt)
}
