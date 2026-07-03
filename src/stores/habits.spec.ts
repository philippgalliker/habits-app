import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { dayOffset, formatFullDate, useHabitsStore } from './habits'

// Vitest runs in the jsdom environment (see vitest.config.ts), so `localStorage`
// exists and the store persists to it. We wipe it before each test so every test
// starts from the same freshly-seeded state instead of leaking into the next.
beforeEach(() => {
  localStorage.clear()
  // Each test gets its own Pinia instance, so stores don't share state.
  setActivePinia(createPinia())
})

// --- Pure helper functions -------------------------------------------------
// These don't need a store or a component — just call them and assert.

describe('dayOffset', () => {
  it('returns an ISO date string of the form YYYY-MM-DD', () => {
    expect(dayOffset(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('goes back in time for negative offsets', () => {
    // Yesterday must sort earlier than today as plain strings (ISO dates do).
    expect(dayOffset(-1) < dayOffset(0)).toBe(true)
  })
})

describe('formatFullDate', () => {
  it('formats a date as a German weekday + day + month label', () => {
    // 2. Juli 2026 is a Thursday.
    expect(formatFullDate('2026-07-02')).toBe('Donnerstag, 2. Juli')
  })
})

// --- The store -------------------------------------------------------------

describe('useHabitsStore', () => {
  it('starts from the seeded categories and entries', () => {
    const habits = useHabitsStore()
    expect(habits.categories).toContain('Kung Fu')
    expect(habits.entries.length).toBeGreaterThan(0)
  })

  it('minutesToday sums only entries dated today', () => {
    const habits = useHabitsStore()
    // Seed has two entries today: Kung Fu 60 + Meditation 10 = 70.
    expect(habits.minutesToday).toBe(70)

    habits.addEntry({ category: 'Meditation', minutes: 5, date: dayOffset(0) })
    expect(habits.minutesToday).toBe(75)

    // An entry on another day must NOT count toward today.
    habits.addEntry({ category: 'Joggen & Kraft', minutes: 99, date: dayOffset(-2) })
    expect(habits.minutesToday).toBe(75)
  })

  it('entryCount counts entries per category', () => {
    const habits = useHabitsStore()
    // Seed has two "Kung Fu" entries.
    expect(habits.entryCount('Kung Fu')).toBe(2)
    expect(habits.entryCount('Meditation')).toBe(1)
    expect(habits.entryCount('does-not-exist')).toBe(0)
  })

  it('addEntry assigns an id and appends the entry', () => {
    const habits = useHabitsStore()
    const before = habits.entries.length

    habits.addEntry({ category: 'Dehnen & Kraft', minutes: 15, date: dayOffset(0) })

    expect(habits.entries.length).toBe(before + 1)
    const added = habits.entries.at(-1)!
    expect(added.id).toBeTruthy()
    expect(added.category).toBe('Dehnen & Kraft')
  })

  describe('addCategory', () => {
    it('adds a new, trimmed category', () => {
      const habits = useHabitsStore()
      habits.addCategory('  Lesen  ')
      expect(habits.categories).toContain('Lesen')
    })

    it('ignores blank input', () => {
      const habits = useHabitsStore()
      const before = habits.categories.length
      habits.addCategory('   ')
      expect(habits.categories.length).toBe(before)
    })

    it('rejects case-insensitive duplicates', () => {
      const habits = useHabitsStore()
      const before = habits.categories.length
      habits.addCategory('kung fu') // already exists as "Kung Fu"
      expect(habits.categories.length).toBe(before)
    })
  })

  describe('entriesByDay', () => {
    it('groups entries by day, most recent first, with labels', () => {
      const habits = useHabitsStore()
      const groups = habits.entriesByDay

      // Dates are sorted descending, so the first group is the newest.
      const dates = groups.map((g) => g.date)
      const sortedDesc = [...dates].sort((a, b) => (a < b ? 1 : -1))
      expect(dates).toEqual(sortedDesc)

      // Today's group is labelled HEUTE, yesterday's GESTERN.
      const today = groups.find((g) => g.date === dayOffset(0))
      const yesterday = groups.find((g) => g.date === dayOffset(-1))
      expect(today?.label).toBe('HEUTE')
      expect(yesterday?.label).toBe('GESTERN')
    })
  })
})
