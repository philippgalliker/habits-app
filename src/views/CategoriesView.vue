<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHabitsStore } from '@/stores/habits'

const router = useRouter()
const habits = useHabitsStore()

const newCategory = ref('')

function add() {
  habits.addCategory(newCategory.value)
  newCategory.value = ''
}
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pt-6 pb-6">
    <!-- Header -->
    <div class="flex items-center gap-2">
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
      <h1 class="text-xl font-semibold text-neutral-900">Kategorien</h1>
    </div>

    <!-- Category list -->
    <ul class="mt-6">
      <li
        v-for="category in habits.categories"
        :key="category"
        class="flex items-center justify-between border-b border-neutral-200 py-4"
      >
        <span class="text-base font-medium text-neutral-900">{{ category }}</span>
        <span class="text-sm text-accent">
          {{ habits.entryCount(category) }}
          {{ habits.entryCount(category) === 1 ? 'Eintrag' : 'Einträge' }}
        </span>
      </li>
    </ul>

    <!-- Add new category -->
    <div class="mt-auto flex items-center gap-3 pt-8">
      <input
        v-model="newCategory"
        type="text"
        placeholder="Neue Kategorie"
        class="flex-1 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:outline-none"
        @keyup.enter="add"
      />
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-5 py-3 text-base font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
        :disabled="!newCategory.trim()"
        @click="add"
      >
        Hinzufügen
      </button>
    </div>
  </div>
</template>
