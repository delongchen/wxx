import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styles from './App.module.scss';
import { SummonerTable } from './components/index.ts';
import { useGameState } from './hook/useGameState.ts';

const queryClient = new QueryClient();

function App() {
  const [state] = useGameState();
  return (
    <div className={styles.container}>
      <QueryClientProvider client={queryClient}>
        <SummonerTable state={state} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
