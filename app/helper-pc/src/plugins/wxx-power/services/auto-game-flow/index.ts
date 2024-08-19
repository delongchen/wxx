import { startAutoAccept } from "./auto-accept";
import { startAutoBallot } from "./auto-ballot";
import { startAutoPlayAgain } from './auto-play-again'
import { concat } from '../utils'


export default concat(
  startAutoAccept,
  startAutoBallot,
  startAutoPlayAgain,
)
