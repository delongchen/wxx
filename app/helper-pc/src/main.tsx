import ReactDOM from "react-dom/client"
import { ChakraProvider } from "@chakra-ui/react"
import { Provider as ReactReduxProvider } from 'react-redux'
import { BrowserRouter } from "react-router-dom"
import store from "./store"
import '@/router'
import App from "@/App.tsx"

import './styles/index.css'

import { use, initPlugins } from './use'
import WxxPower from "@/plugins/wxx-power";

const root = ReactDOM.createRoot(
  document.getElementById('root')!
)

const render = () => {
  root.render(
    <ChakraProvider>
      <ReactReduxProvider store={store}>
        <BrowserRouter>
          <App/>
        </BrowserRouter>
      </ReactReduxProvider>
    </ChakraProvider>
  )
}

const main = async () => {
  use(WxxPower)

  await initPlugins()

  render()
}

main().catch(console.error)
