<template>
  <div class="standings-container">
    <h2>Team Standen</h2>

    <template v-if="canFetch">

      <!-- Step 1: fetch teams -->
      <div class="form-group">
        <label class="leftLabel">Team:</label>
        <button type="button" class="btn-fetch" :disabled="loadingTeams" @click="fetchTeams">
          {{ loadingTeams ? 'Laden…' : 'Teams ophalen' }}
        </button>
      </div>
      <div class="status-msg error" v-if="teamError">{{ teamError }}</div>
      <div class="form-group" v-if="teams.length">
        <label class="leftLabel"></label>
        <select v-model="localConfig.standingTeamId" @change="onTeamChange">
          <option value="">— Kies een team —</option>
          <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>

      <!-- Step 2: fetch competitions (once team is selected) -->
      <template v-if="localConfig.standingTeamId">
        <div class="form-group">
          <label class="leftLabel">Competitie:</label>
          <button type="button" class="btn-fetch" :disabled="loadingComps" @click="fetchCompetitions">
            {{ loadingComps ? 'Laden…' : 'Competities ophalen' }}
          </button>
        </div>
        <div class="status-msg error" v-if="compError">{{ compError }}</div>
        <div class="form-group" v-if="competitions.length">
          <label class="leftLabel"></label>
          <select v-model="localConfig.standingPoolId">
            <option value="">— Kies een competitie —</option>
            <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </template>

    </template>
    <p class="hint" v-else>
      Standen zijn beschikbaar via Sportlink API en Sportlink Proxy. Kies eerst een sport en verbindingstype.
    </p>

    <!-- Columns -->
    <hr/>
    <p class="section-label">Zichtbare kolommen</p>
    <div class="cols-grid">
      <label v-for="(label, key) in COL_DEFS" :key="key" class="col-check">
        <input type="checkbox" v-model="localConfig.standingColumns[key]">
        {{ label }}
      </label>
    </div>

    <!-- Column widths -->
    <hr/>
    <p class="section-label">Kolombreedte (px)</p>
    <div class="form-group">
      <label class="leftLabel"># Positie:</label>
      <input type="number" v-model.number="localConfig.standingColWidths.pos" min="20" max="200">
      <span class="hint-inline">px</span>
    </div>
    <div class="form-group">
      <label class="leftLabel">M / W / G / V:</label>
      <input type="number" v-model.number="localConfig.standingColWidths.stat" min="20" max="200">
      <span class="hint-inline">px</span>
    </div>
    <div class="form-group">
      <label class="leftLabel">+ / - / +/-:</label>
      <input type="number" v-model.number="localConfig.standingColWidths.goal" min="20" max="200">
      <span class="hint-inline">px</span>
    </div>
    <div class="form-group">
      <label class="leftLabel">Pts:</label>
      <input type="number" v-model.number="localConfig.standingColWidths.pts" min="20" max="200">
      <span class="hint-inline">px</span>
    </div>

    <!-- Own-team colour -->
    <hr/>
    <p class="section-label">Eigen team kleur</p>
    <div class="form-group">
      <label class="leftLabel">Achtergrond:</label>
      <div class="color-input-wrapper">
        <input type="color" :value="localConfig.ownTeamBg"
               @input="localConfig.ownTeamBg = $event.target.value">
        <input type="text" v-model="localConfig.ownTeamBg" placeholder="#RRGGBB"
               @blur="validateHex('ownTeamBg', '#1a5c1a')">
      </div>
    </div>
    <div class="form-group">
      <label class="leftLabel">Tekst:</label>
      <div class="color-input-wrapper">
        <input type="color" :value="localConfig.ownTeamText"
               @input="localConfig.ownTeamText = $event.target.value">
        <input type="text" v-model="localConfig.ownTeamText" placeholder="#RRGGBB"
               @blur="validateHex('ownTeamText', '#ffffff')">
      </div>
    </div>

    <!-- Display -->
    <hr/>
    <p class="section-label">Weergave</p>
    <div class="form-group">
      <label class="leftLabel">Hoogte (px):</label>
      <input type="number" v-model.number="localConfig.displayHeight" min="0" max="9999">
      <span class="hint-inline">0 = automatisch</span>
    </div>
    <div class="form-group">
      <label class="leftLabel">Scrollsnelheid:</label>
      <input type="number" v-model.number="localConfig.scrollSpeed" min="1" max="20">
      <span class="hint-inline">px per stap</span>
    </div>

    <button class="btn-save" @click="save">Opslaan</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { APP_CREDENTIALS, USER_CONFIG, updateUserConfig } from '@/config';
import { fetchWithConfig } from '@/utils/matchFetchHelpers/fetchUtils';
import { useSportlinkAuth } from '@/composables/useSportlinkAuth';

const CORS_PROXY = 'https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=';
const proxied = (url) => CORS_PROXY + encodeURIComponent(url);

const COL_DEFS = {
  totalMatches: 'M — Gespeeld',
  won:          'W — Gewonnen',
  draw:         'G — Gelijk',
  lost:         'V — Verloren',
  goalsFor:     '+ — Goals voor',
  goalsAgainst: '- — Goals tegen',
  goalsDiff:    '+/- — Doelsaldo',
  points:       'Pts — Punten',
};

const props = defineProps({
  config: { type: Object, required: true },
});
const emit = defineEmits(['update:config']);

const auth = useSportlinkAuth();

function initLocal(src) {
  const c = JSON.parse(JSON.stringify(src));
  if (!c.standingColWidths) c.standingColWidths = { pos: 52, stat: 44, goal: 44, pts: 52 };
  return c;
}

const localConfig = ref(initLocal(props.config));

watch(() => props.config, (val) => {
  if (JSON.stringify(localConfig.value) !== JSON.stringify(val)) {
    localConfig.value = initLocal(val);
  }
}, { deep: true });

// teams / competitions state
const teams        = ref([]);
const competitions = ref([]);
const loadingTeams = ref(false);
const loadingComps = ref(false);
const teamError    = ref(null);
const compError    = ref(null);

const canFetch = computed(() => {
  const t = localConfig.value.connectionType;
  return t === 'Sportlink API' || t === 'Sportlink Proxy';
});

function onTeamChange() {
  competitions.value = [];
  compError.value    = null;
  localConfig.value.standingPoolId = null;
}

// ── Team fetch ─────────────────────────────────────────────────────────────

async function fetchTeams() {
  loadingTeams.value = true;
  teamError.value    = null;
  teams.value        = [];

  try {
    const connType = localConfig.value.connectionType;

    if (connType === 'Sportlink API') {
      const resp = await fetch(
        `https://data.sportlink.com/teams?gebruiklokaleteamgegevens=NEE&client_id=${localConfig.value.clientId}`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error('Ongeldig API-antwoord');

      const seen = new Set();
      teams.value = data
        .filter(t => { if (seen.has(t.teamcode)) return false; seen.add(t.teamcode); return true; })
        .map(t => ({ id: String(t.teamcode), name: t.teamnaam }));

    } else {
      const appCreds = getAppCreds();
      const url = `https://app-${appCreds.apiUrl}-production.sportlink.com/entity/common/memberportal/app/club/ClubTeams?v=1&ClubId=${localConfig.value.clubId}`;
      const data = await proxyGet(url, appCreds);
      const items = data.Team ?? data.ClubTeam ?? [];
      teams.value = items
        .filter(t => t.PublicTeamId || t.TeamId)
        .map(t => ({ id: String(t.PublicTeamId ?? t.TeamId), name: t.TeamName ?? t.Name ?? '' }));
    }

    if (!teams.value.length) throw new Error('Geen teams gevonden voor deze configuratie.');

  } catch (err) {
    teamError.value = err.message;
  } finally {
    loadingTeams.value = false;
  }
}

// ── Competition fetch ──────────────────────────────────────────────────────

async function fetchCompetitions() {
  loadingComps.value = true;
  compError.value    = null;
  competitions.value = [];

  try {
    const connType = localConfig.value.connectionType;
    const teamId   = localConfig.value.standingTeamId;

    if (connType === 'Sportlink API') {
      const resp = await fetch(
        `https://data.sportlink.com/teampoulelijst?teamcode=${teamId}&lokaleteamcode=-1&client_id=${localConfig.value.clientId}`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error('Ongeldig API-antwoord');

      competitions.value = data
        .filter(c => c.poulecode)
        .map(c => ({ id: String(c.poulecode), name: c.teamnaam || String(c.poulecode) }));

    } else {
      const appCreds = getAppCreds();
      const url = `https://app-${appCreds.apiUrl}-production.sportlink.com/entity/common/memberportal/app/team/TeamCompetitionData?v=2&PublicTeamId=${teamId}`;
      const data = await proxyGet(url, appCreds);

      const raw = data.TeamCompetition ?? data.Competition ?? data.Pool ?? (Array.isArray(data) ? data : []);
      competitions.value = [];
      for (const entry of raw) {
        const poolId = entry.PoolId;
        if (!poolId) continue;
        const kind  = entry.CompetitionKind ?? '';
        const cls   = entry.ClassName ?? entry.CompetitionClass ?? entry.Class ?? '';
        const label = kind === 'DEFAULT_COMPETITION'
          ? `Competitie${cls ? ' ' + cls : ''}`
          : cls || 'Beker / Toernooi';
        competitions.value.push({ id: String(poolId), name: label });
      }
    }

    if (!competitions.value.length) throw new Error('Geen competities gevonden voor dit team.');

  } catch (err) {
    compError.value = err.message;
  } finally {
    loadingComps.value = false;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getAppCreds() {
  const label = localConfig.value.gameType?.label ?? '';
  const creds = APP_CREDENTIALS.find(c => c.type.toLowerCase() === label.toLowerCase());
  if (!creds) throw new Error('Geen API-gegevens voor dit sporttype.');
  return creds;
}

async function proxyGet(url, appCreds) {
  let resp;
  try {
    resp = await fetchWithConfig(proxied(url), true, appCreds);
  } catch (err) {
    if (err.message === 'No valid token available') {
      const ok = localConfig.value.fakeCredentials
        ? await auth.useFakeCredentials(appCreds)
        : await auth.login(localConfig.value.username, localConfig.value.password, appCreds);
      if (!ok) throw new Error('Inloggen mislukt. Sla je inloggegevens op in Instellingen.');
      resp = await fetchWithConfig(proxied(url), true, appCreds);
    } else {
      throw err;
    }
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

function validateHex(field, fallback) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(localConfig.value[field])) {
    localConfig.value[field] = fallback;
  }
}

// ── Save ───────────────────────────────────────────────────────────────────

function save() {
  emit('update:config', { ...localConfig.value });
  updateUserConfig({ ...USER_CONFIG.value, ...localConfig.value });
}
</script>

<style scoped>
.standings-container {
  padding: 24px 20px;
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.94);
  color: #1e293b;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
}

h2 {
  margin: 0 0 20px;
  font-size: 1.2em;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.01em;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

hr {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  margin: 14px 0 10px;
}

.section-label {
  font-size: 0.78em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin: 0 0 8px;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.leftLabel {
  font-weight: 600;
  font-size: 0.88em;
  color: #475569;
  width: 120px;
  flex-shrink: 0;
}

input[type="text"],
input[type="number"],
select {
  flex: 1;
  padding: 7px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9em;
  font-family: inherit;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  background: #fff;
}

.hint-inline {
  font-size: 0.8em;
  color: #94a3b8;
  white-space: nowrap;
}

.cols-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  margin-bottom: 4px;
}

.col-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88em;
  color: #334155;
  cursor: pointer;
}

.col-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.color-input-wrapper input[type="color"] {
  width: 36px;
  height: 36px;
  padding: 2px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  flex-shrink: 0;
}

.color-input-wrapper input[type="text"] {
  width: 80px;
  flex: 0 0 80px;
  padding: 6px 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85em;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
}

.btn-fetch {
  padding: 6px 14px;
  font-size: 0.88em;
  font-weight: 500;
  background: #f1f5f9;
  color: #1e293b;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn-fetch:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.btn-fetch:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-save {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  font-size: 0.95em;
  font-weight: 600;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover {
  background: #1d4ed8;
}

.status-msg {
  font-size: 0.85em;
  font-weight: 600;
  margin: 0 0 8px;
  padding: 6px 10px;
  border-radius: 6px;
}

.status-msg.error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.hint {
  font-size: 0.85em;
  color: #64748b;
  margin: 0 0 12px;
}
</style>
