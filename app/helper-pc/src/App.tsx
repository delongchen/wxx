import { SummonerTable } from "./components/index.ts";
import { useGameState } from "./hook/useGameState.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import styles from "./App.module.scss";

const queryClient = new QueryClient();

function App() {
  const [state] = useGameState();
  return (
    <div className={styles.container}>
      <QueryClientProvider client={queryClient}>
        {/* <TestComponent state={state} /> */}
        <SummonerTable state={state} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
