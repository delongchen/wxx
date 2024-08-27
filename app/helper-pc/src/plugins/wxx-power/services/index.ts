import { concat } from './utils';

import autoGameFlow from './auto-game-flow';
import { collectSummoner } from './info-collect/collect-summoner';

export const startServices = concat(autoGameFlow, collectSummoner);
