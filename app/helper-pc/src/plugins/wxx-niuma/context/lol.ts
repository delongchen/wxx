import { ChampionComplex } from '../api/dragon'
import { createContext } from 'react'

interface LolContextType {
  championsPromise: Promise<ChampionComplex>
}

const defaultContext: LolContextType = {
  championsPromise: Promise.reject(),
}

export const LolContext = createContext<LolContextType>(defaultContext)
