<template>
  <div class="wrapper">
    <div class="containers-row">
      <component
        :is="popupComponent"
        :visible="showClubSelectPopup"
        :clubs="clubs"
        @close="showClubSelectPopup = false"
        @save="handleClubSelected"
      />

      <ConfigSettings :cors-status="corsStatus" />
      <StyleCustomization />
      <SponsorManager
        :sponsor-images="sponsorStore.userImages"
        @add-sponsor="sponsorStore.add"
        @remove-sponsor="sponsorStore.remove"
      />
      <StandingsSettings />
    </div>

    <NavigationButtons />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useConfigStore } from '@/stores/configStore';
import { useSponsorStore } from '@/stores/sponsorStore';
import { applyBackground } from '@/utils/background';
import { IS_TIZEN } from '@/utils/platform';

import { useSportlinkAuth } from '@/composables/useSportlinkAuth';
import { useClubData } from '@/composables/useClubData';
import { useConfigWatchers } from '@/composables/useConfigWatchers';

import ConfigSettings from '@/components/ConfigSettings.vue';
import StyleCustomization from '@/components/StyleCustomization.vue';
import SponsorManager from '@/components/SponsorManager.vue';
import NavigationButtons from '@/components/NavigationButtons.vue';
import ClubSelectPopup from '@/components/ClubSelectPopup.vue';
import ClubSelectPopupTv from '@/components/ClubSelectPopupTv.vue';
import StandingsSettings from '@/components/StandingsSettings.vue';

const popupComponent = IS_TIZEN ? ClubSelectPopupTv : ClubSelectPopup;

const store = useConfigStore();
const { config } = store;
const sponsorStore = useSponsorStore();
const showClubSelectPopup = ref(false);

const sportlinkAuth = useSportlinkAuth();
const clubData = useClubData(config);
const { clubs, corsStatus, fetchCorsStatus } = clubData;
const { setupWatchers, cleanup } = useConfigWatchers(config, { sportlinkAuth, clubData, showClubSelectPopup });

function handleClubSelected(club) {
  config.clubName = club.ClubName;
  config.sportLocatie = club.City;

  if (config.connectionType === 'Nevobo Proxy') {
    config.clubIdentifer = club.ClubId;
  } else if (config.connectionType === 'Sportlink Proxy') {
    config.clubId = club.ClubId;
  }

  showClubSelectPopup.value = false;
}

watch(
  () => [config.selectedBackground, config.customBackgroundUrl],
  () => applyBackground(config)
);

onMounted(async () => {
  sponsorStore.load();
  applyBackground(config);

  if (config.connectionType !== 'Sportlink API') {
    await fetchCorsStatus();
  }

  setupWatchers();
});

onUnmounted(() => {
  cleanup();
  store.flush();
});
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.containers-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

@media (max-width: 940px) {
  .containers-row {
    flex-direction: column;
    align-items: center;
  }
}
</style>
