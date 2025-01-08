export interface LolChampionSummary {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number,
    defense: number,
    magic: number,
    difficulty: number,
  },
  tags: string[],
  image: {
    full: string,
    sprite: string,
    group: string,
    x: number,
    y: number,
    w: number,
    h: number,
  },
  partype: string;
  stats: {
    hp: number,
    hpperlevel: number,
    mp: number,
    mpperlevel: number,
    movespeed: number,
    armor: number,
    armorperlevel: number,
    spellblock: number,
    spellblockperlevel: number,
    attackrange: number,
    hpregen: number,
    hpregenperlevel: number,
    mpregen: number,
    mpregenperlevel: number,
    crit: number,
    critperlevel: number,
    attackdamage: number,
    attackdamageperlevel: number,
    attackspeedperlevel: number,
    attackspeed: number,
  }
}

export interface LolChampionSummaries {
  version: string;
  data: Record<string, LolChampionSummary>;
}

type AllowedLang = 'zh_CN' | 'en_US'

export const fetchVersions = async () => {
  return await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    .then(res => res.json() as Promise<string[]>);
};

export const fetchChampionSummaries = async (version: string, lang: AllowedLang) => {
  return await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/champion.json`)
    .then(res => res.json() as Promise<LolChampionSummaries>);
};

export const fetchLatestChampionSummaries = async (lang: AllowedLang) => {
  const versions = await fetchVersions();
  return await fetchChampionSummaries(versions[0], lang);
};
