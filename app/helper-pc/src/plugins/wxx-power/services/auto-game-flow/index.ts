import { startAutoAccept } from "./auto-accept";
import { startAutoBallot } from "./auto-ballot";
import { startAutoPlayAgain } from './auto-play-again'


export const startAutoGameFlow = () => {
  const stopFns = [
    startAutoAccept,
    startAutoBallot,
    startAutoPlayAgain,
  ].map(fn => fn())

  return () => {
    stopFns.forEach(stopFn => stopFn())
    stopFns.length = 0
  }
}
