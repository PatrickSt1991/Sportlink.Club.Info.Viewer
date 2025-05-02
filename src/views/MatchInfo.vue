<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd programma aankomende {{ config.programmaDagen }} dagen</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd programma worden geladen...</h1>
      </div>

      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <NoMatchesDisplay 
        v-else-if="matches.length === 0"
        title="Geen wedstrijd programma"
        :message="dateRangeText" />

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumProgramma_fixed">{{ match.wedstrijddatum }}</div>
            <img :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="clublogo" :src="match.thuisteamlogo">
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">-</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <img :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="clublogo" :src="match.uitteamlogo">
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">{{ match.competitiesoort }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { USER_CONFIG } from '@/config';
import { useRouter } from 'vue-router';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';
import { useScrollHelper } from '../utils/scrollHelper';

const router = useRouter();
const matches = ref([]);
const error = ref(null);
const loading = ref(false);
const config = ref({});

const {
    scrollingContainerHeight,
    calculateScrollingContainerHeight,
    startScrolling,
    tryStartScrolling,
    stopScrolling
} = useScrollHelper(router, config);


const fetchMatchInfo = async () => {
  if (!config.value?.programmaDagen || (!config.value?.clientId && !config.value?.clubIdentifer && !config.value?.clubId)) {
    console.error('Config not loaded yet!');
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    let response;
    let url;

    if(config.value.gameType?.type === 'Sportlink API'){
      url = `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${config.value.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${config.value.clientId}`
    }else if(config.value.gameType?.type === 'Nevobo Proxy'){
      url = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.value.clubIdentifer}`;
      url =`https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    }else if(config.value.gameType?.type === 'Sportlink Proxy'){
      url = `https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.value.clubId}`;
      url = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    }

    if(config.value.gameType?.type !== 'Sportlink Proxy')
    {
      try{
        response = await fetch(url);
      } catch (error) {
        console.error('Full fetch error:', error);
        throw error;
      }
    }else{
      try{
        const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));

        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenInfo?.access_token}`,
            'X-Real-User-Agent': `sportlink-app-${config.value.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
            'X-Navajo-Instance': `${config.value.gameType?.instance}`,
            'X-Navajo-Locale': 'nl',
            'X-Navajo-Version': '2',
            'Accept': '*/*'
          },
        });
      } catch (error) {
        console.error('Full fetch error:', error);
        throw error;
      }
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const now = new Date();
    const dateThreshold = new Date(now);
    dateThreshold.setDate(now.getDate() + config.value.programmaDagen);

    if(config.value.gameType?.type === 'Sportlink API'){
      try{
        matches.value = data.map(match => {
          match.competitiesoort = formatCompType(match.competitiesoort);
          match.wedstrijddatum = formatDateTime(match.wedstrijddatum)
          return match;
        });
      }catch(error){
        console.error("Unexpected data format on Sportlink API:", error);
      }
    }

    if(config.value.gameType?.type === 'Sportlink Proxy'){
      const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
      try
      {
        const matchesRaw = data.ProgramItemMatchClub
        .filter(item => {
          const matchDate = new Date(item.Match.MatchDateTime);
          
          return (
            matchDate >= now &&
            matchDate <= dateThreshold
          );
        });
        matches.value = await Promise.all(
          matchesRaw.map(async match => {
            const homeLogoBucket = match.Match.HomeTeam.Club.ClubLogo?.Bucket
            const homeLogoHash = match.Match.HomeTeam.Club.ClubLogo?.Hash;
            const awayLogoBucket = match.Match.AwayTeam.Club.ClubLogo?.Bucket
            const awayLogoHash = match.Match.AwayTeam.Club.ClubLogo?.Hash;

            const fetchLogo = async (bucket, hash) => {
              const url = `https://binaries.sportlink.com/${bucket}/${hash}?img.op=resize&img.width=200&img.height=200`;
              const proxyUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
              const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${tokenInfo?.access_token}`,
                  'X-Real-User-Agent': `sportlink-app-${config.value.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
                  'X-Navajo-Instance': `${config.value.gameType?.instance}`,
                  'X-Navajo-Locale': 'nl',
                }
              });
              const blob = await response.blob();
              return URL.createObjectURL(blob);
            };

            const thuisteamlogo = homeLogoHash ? await fetchLogo(homeLogoBucket, homeLogoHash) : null;
            const uitteamlogo = awayLogoHash ? await fetchLogo(awayLogoBucket, awayLogoHash) : null;

            return {
              wedstrijddatum: formatDateTime(match.Match.MatchDateTime),
              thuisteam: match.Match.HomeTeam.TeamName,
              uitteam: match.Match.AwayTeam.TeamName,
              thuisteamlogo,
              uitteamlogo,
              competitiesoort: formatCompType(match.Match.Pool.CompetitionKind),
            };
          })
        );
      }catch(error)
      {
        console.error("Unexpected data format on Sportlink Proxy:", error); 
      }
    }

    if(config.value.gameType?.type === 'Nevobo Proxy'){
      try{

        matches.value = data._embedded.items
        .filter(match => {
          const matchDate = new Date(match.datum);
          return matchDate >= now && matchDate <= dateThreshold;
        })
        .map(match => {
          const thuisteamparts = match._embedded.pouleindeling_thuis._embedded.team.naam.split(/\s*\/+\s*/);
          const uitteamparts = match._embedded.pouleindeling_uit._embedded.team.naam.split(/\s*\/+\s*/);

          match.wedstrijddatum = formatDateTime(match.tijd);
          match.thuisteam = thuisteamparts[thuisteamparts.length - 1].trim();
          match.thuisteamlogo = match._embedded?.pouleindeling_thuis?._embedded.team?._embedded?.vereniging?._links?.logo_url?.href || noImage;

          match.uitteam = uitteamparts[uitteamparts.length - 1].trim();
          match.uitteamlogo = match._embedded?.pouleindeling_uit?._embedded?.team?._embedded?.vereniging?._links?.logo_url?.href || noImage;
          match.competitiesoort = formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || '');
          
          return match;
        });
      }catch(error){
        console.error("Unexpected data format on Nevobo Proxy:", error);
      }
    }

    if (matches.value.length > 0) {
      await nextTick();
      tryStartScrolling();
    }
  } catch (err) {
    error.value = 'Error tijdens het laden van de wedstrijd informatie...';
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => USER_CONFIG.value, (newConfig) => {
  if (!newConfig) return;
  
  config.value = { ...newConfig };
  
  const missingClientId = !newConfig.clientId;
  const missingClubIdentifier = !newConfig.clubIdentifer;
  const missingClubId = !newConfig.clubId;
  const missingUitslagDagen = !newConfig.uitslagDagen;
  
  if (missingUitslagDagen || (missingClientId && missingClubIdentifier && missingClubId)) {
    router.push('/settings');
  } else {
    fetchMatchInfo();
  }
}, { immediate: true, deep: true });

onMounted(() => {
  calculateScrollingContainerHeight(); // Now calling the correctly named function
  window.addEventListener('resize', calculateScrollingContainerHeight);

  if(matches.value.length > 0){
    nextTick().then(startScrolling);
  }
});

onUnmounted(() => {
  stopScrolling();
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>