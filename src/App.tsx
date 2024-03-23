import { TestComponent } from "./components/TestComponent/TestComponent.tsx";
import { useGameState } from "./hook/useGameState.ts";

function App() {
  const [state] = useGameState();
  return (
    <div className="container">
      {state}
      <TestComponent state={state} />
    </div>
  );
}

export default App;
