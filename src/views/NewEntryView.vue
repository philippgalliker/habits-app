<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dayOffset, useHabitsStore } from '@/stores/habits'

const router = useRouter()
const habits = useHabitsStore()

const selectedCategory = ref<string | null>(null)
const minutes = ref(20)
const dateMode = ref<'today' | 'yesterday' | 'custom'>('today')
const customDate = ref(dayOffset(0))

const effectiveDate = computed(() => {
  if (dateMode.value === 'today') return dayOffset(0)
  if (dateMode.value === 'yesterday') return dayOffset(-1)
  return customDate.value
})

const canSave = computed(() => selectedCategory.value !== null)

function save() {
  if (!selectedCategory.value) return
  habits.addEntry({
    category: selectedCategory.value,
    minutes: minutes.value,
    date: effectiveDate.value,
  })
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pt-6 pb-6">
    <!-- Back navigation -->
    <button
      type="button"
      class="-ml-1 flex h-9 w-9 items-center justify-center text-neutral-800 transition hover:opacity-70"
      aria-label="Zurück"
      @click="router.push({ name: 'home' })"
    >
      <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" stroke="currentColor" stroke-width="2">
        <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <h1 class="mt-4 text-2xl font-bold text-neutral-900">Was möchtest du festhalten?</h1>

    <!-- Category picker -->
    <ul class="mt-6 space-y-1">
      <li v-for="category in habits.categories" :key="category">
        <button
          type="button"
          class="w-full rounded-xl px-4 py-3 text-left text-lg transition"
          :class="
            selectedCategory === category
              ? 'bg-accent/[0.06] font-medium text-accent'
              : 'text-neutral-800 hover:bg-neutral-100'
          "
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </li>
    </ul>

    <!-- Minutes slider -->
    <div class="mt-8 px-1">
      <div class="flex items-baseline gap-2">
        <span class="text-5xl font-bold text-neutral-900">{{ minutes }}</span>
        <span class="text-lg text-accent">Min</span>
      </div>
      <input
        v-model.number="minutes"
        type="range"
        min="5"
        max="120"
        step="5"
        class="mt-3 w-full accent-accent"
      />
      <div class="mt-1 flex justify-between text-sm text-neutral-500">
        <span>5 Min</span>
        <span>120 Min</span>
      </div>
    </div>

    <!-- Date selection -->
    <div class="mt-8 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-full px-5 py-2 text-sm font-medium transition"
        :class="
          dateMode === 'today'
            ? 'bg-accent text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        "
        @click="dateMode = 'today'"
      >
        Heute
      </button>
      <button
        type="button"
        class="rounded-full px-5 py-2 text-sm font-medium transition"
        :class="
          dateMode === 'yesterday'
            ? 'bg-accent text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        "
        @click="dateMode = 'yesterday'"
      >
        Gestern
      </button>
      <input
        v-model="customDate"
        type="date"
        class="rounded-lg border px-3 py-2 text-sm text-neutral-700 transition accent-accent"
        :class="dateMode === 'custom' ? 'border-accent' : 'border-neutral-200 bg-neutral-100'"
        @focus="dateMode = 'custom'"
        @input="dateMode = 'custom'"
      />
    </div>

    <!-- Footer action -->
    <div class="mt-auto pt-8">
      <button
        type="button"
        class="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canSave"
        @click="save"
      >
        Fertig
      </button>
    </div>
  </div>
</template>
