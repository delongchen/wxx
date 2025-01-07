import ReactDOM from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { Provider as ReactReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import { use } from './app/plugin/manager';
import App from '@/App.tsx';

import './styles/index.css';

import WxxPower from '@/plugins/wxx-power';
import WxxLifeGame from '@/plugins/wxx-life-game';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const render = () => {
  root.render(
    <ChakraProvider value={defaultSystem}>
      <ReactReduxProvider store={store}>
        <BrowserRouter><App /></BrowserRouter>
      </ReactReduxProvider>
    </ChakraProvider>,
  );
};

const main = async () => {
  use(WxxPower);
  use(WxxLifeGame);

  render();
};

main().catch(console.error);
