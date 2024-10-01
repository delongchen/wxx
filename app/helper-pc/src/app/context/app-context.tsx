import {PropsWithChildren, createContext, useContext, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "@/store";
import {fetchLocalConfig, selectGlobal} from "@/store/modules/global";

interface AppContextType {
  theme: string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: PropsWithChildren) {
  const { theme } = useAppSelector(selectGlobal)
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLocalConfig());
  }, []);

  return (
    <AppContext.Provider value={{ theme }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppCtx = () => {
  const ctx = useContext(AppContext)
  if (ctx === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return ctx
}

export const useAppTheme = () => {
  const ctx = useContext(AppContext)
  if (ctx === undefined) {
    throw new Error('useAppTheme must be used within an AppProvider')
  }
  return ctx.theme
}
