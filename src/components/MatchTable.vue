<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners_matchinfo_fixed">
      <div class="matchEntry match-header">
        <template v-for="col in visibleColumns" :key="col.key">
          <div v-if="col.type === 'logo'" class="clublogo-wrap" :style="{ background: colors(col).background }"></div>
          <div v-else class="matchCol" :class="col.cssClass" :style="colStyle(col)">{{ col.header }}</div>
        </template>
      </div>

      <div v-if="loading" id="noMatchMessage">
        <h1>{{ loadingText }}</h1>
      </div>

      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <NoMatchesDisplay v-else-if="rows.length === 0" :title="emptyTitle" :message="emptyMessage" />

      <div v-else ref="scrollEl" class="scrollingContainer" :style="{ height: containerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="row in rows" :key="row.id" class="matchEntry">
            <template v-for="col in visibleColumns" :key="col.key">
              <div v-if="col.type === 'logo'" class="clublogo-wrap" :style="{ background: colors(col).background }">
                <img class="clublogo" :src="row[col.field] || noImage" alt="" />
              </div>
              <div v-else class="matchCol" :class="col.cssClass" :style="colStyle(col)">
                {{ col.format ? col.format(row) : row[col.field] }}
              </div>
            </template>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import noImage from '@/assets/no_image.png';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';
import { useAutoScroll } from '@/composables/useAutoScroll';
import { useConfigStore } from '@/stores/configStore';
import { nextScreen } from '@/utils/screenRotation';
import { DEFAULT_FLEX } from './matchColumns';

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  loadingText: { type: String, default: 'Laden...' },
  emptyTitle: { type: String, default: 'Geen wedstrijden' },
  emptyMessage: { type: String, default: '' },
});

const { config } = useConfigStore();
const route = useRoute();
const router = useRouter();
const scrollEl = ref(null);

const visibleColumns = computed(() =>
  props.columns.filter((col) => {
    if (col.type === 'logo') return config.showLogos !== false;
    return col.alwaysVisible || config.columnVisible?.[col.section] !== false;
  })
);

function colors(col) {
  const section = col.colorSection ?? col.section;
  return { background: config[`${section}BoxColor`], color: config[`${section}BoxText`] };
}

function colStyle(col) {
  return { ...colors(col), flex: config.columnWidths?.[col.section] ?? col.flex ?? DEFAULT_FLEX[col.section] };
}

function switchScreen() {
  const next = nextScreen(route.path, config);
  if (!next) return false;
  router.push(next);
  return true;
}

const { containerHeight, recalcHeight, start } = useAutoScroll(scrollEl, {
  onCyclesComplete: switchScreen,
  onIdle: switchScreen,
});

async function restart() {
  await nextTick();
  recalcHeight();
  start();
}

watch(() => props.rows, restart);
onMounted(restart);
</script>
