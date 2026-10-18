/**
 * Column definitions for the three match screens.
 *
 * key          unique per table
 * type         'text' (default) or 'logo'
 * header       header label
 * field        row property to render
 * format(row)  optional custom renderer
 * section      which colour/width/visibility settings apply: left | leftMid | mid | rightMid | right
 * colorSection override colours only (used by logos and the extra "Veld" column)
 * alwaysVisible ignore the "Zichtbaar" setting
 * flex         default width when the user has not set one
 * cssClass     base layout class from style.css
 */
export const DEFAULT_FLEX = { left: 2, leftMid: 9, mid: 4, rightMid: 9, right: 3 };

const dateCol = (header, field) => ({ key: 'date', header, field, section: 'left', cssClass: 'col-date' });
const homeCol = { key: 'home', header: 'Thuis', field: 'thuisteam', section: 'leftMid', cssClass: 'col-team' };
const awayCol = { key: 'away', header: 'Gasten', field: 'uitteam', section: 'rightMid', cssClass: 'col-team' };
const compCol = { key: 'comp', header: 'Competitie', field: 'competitiesoort', section: 'right', cssClass: 'col-comp' };
const homeLogo = { key: 'homeLogo', type: 'logo', field: 'thuisteamlogo', colorSection: 'leftMid' };
const awayLogo = { key: 'awayLogo', type: 'logo', field: 'uitteamlogo', colorSection: 'rightMid' };

export const PROGRAM_COLUMNS = [
  dateCol('Datum', 'wedstrijddatum'),
  homeLogo,
  homeCol,
  { key: 'mid', header: 'Aanvang', format: () => '-', section: 'mid', cssClass: 'col-mid' },
  awayCol,
  awayLogo,
  compCol,
];

export const RESULT_COLUMNS = [
  dateCol('Datum', 'datumopgemaakt'),
  homeLogo,
  homeCol,
  { key: 'mid', header: 'Uitslag', field: 'uitslag', section: 'mid', cssClass: 'col-mid' },
  awayCol,
  awayLogo,
  compCol,
];

export const PREMATCH_COLUMNS = [
  dateCol('Aanvang', 'wedstrijddatum'),
  homeCol,
  { key: 'mid', header: 'Kleedkamer', field: 'kleedkamerthuisteam', section: 'mid', cssClass: 'col-mid' },
  awayCol,
  { key: 'right', header: 'Kleedkamer', field: 'kleedkameruitteam', section: 'right', flex: 4, cssClass: 'col-mid' },
  { key: 'veld', header: 'Veld', field: 'veld', section: 'left', alwaysVisible: true, cssClass: 'col-comp' },
];
