import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.tsx";


// TODO: test, remove later
import { WxxCore, LcuEventType } from "tauri-plugin-wxx-core";
WxxCore.listen(
  LcuEventType.Log,
  ev => {
    console.log(ev)
  }
)

const root = ReactDOM.createRoot(
  document.getElementById('root')!
)

root.render(
  <ChakraProvider>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </ChakraProvider>
);
