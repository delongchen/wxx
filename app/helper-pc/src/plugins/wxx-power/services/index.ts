import { concat } from './utils';

import autoGameFlow from './auto-game-flow';
import { baseInfoShare } from '@/plugins/wxx-power/services/info-share/base-info-share.ts';

export const startServices = concat(autoGameFlow, baseInfoShare);
