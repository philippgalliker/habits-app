<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatFullDate, dayOffset, useHabitsStore } from '@/stores/habits'

const router = useRouter()
const habits = useHabitsStore()

const todayLabel = computed(() => formatFullDate(dayOffset(0)).toUpperCase())
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pt-10 pb-6">
    <!-- Header: date + minutes today -->
    <header>
      <p class="text-xs font-semibold tracking-widest text-accent">{{ todayLabel }}</p>
      <p class="mt-3 text-7xl leading-none font-bold text-neutral-900">
        {{ habits.minutesToday }}
      </p>
      <p class="mt-2 text-lg text-accent">Minuten heute</p>
    </header>

    <!-- Entries grouped by day -->
    <div class="mt-10 space-y-8">
      <section v-for="group in habits.entriesByDay" :key="group.date">
        <h2 class="text-xs font-semibold tracking-widest text-accent">{{ group.label }}</h2>
        <ul class="mt-1">
          <li
            v-for="entry in group.items"
            :key="entry.id"
            class="flex items-center justify-between border-b border-neutral-200 py-4"
          >
            <span class="text-base text-neutral-900">{{ entry.category }}</span>
            <span class="text-base text-neutral-500">{{ entry.minutes }} Min</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- Footer actions -->
    <div class="mt-auto pt-8">
      <button
        type="button"
        class="text-sm text-accent transition hover:opacity-70"
        @click="router.push({ name: 'categories' })"
      >
        Kategorien bearbeiten
      </button>
      <button type="button" class="btn-primary mt-4" @click="router.push({ name: 'new-entry' })">
        Neuer Eintrag
      </button>
    </div>
  </div>
</template>
