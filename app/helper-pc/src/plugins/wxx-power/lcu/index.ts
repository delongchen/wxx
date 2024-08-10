import {appListener} from "./app-listener";
import {
  autoAcceptHandler,
  autoNextHandler,
} from './tik-tok-helper'

import { curSummonerHandler } from './summoner'

appListener.register([
  autoNextHandler,
  autoAcceptHandler,
  curSummonerHandler,
])
