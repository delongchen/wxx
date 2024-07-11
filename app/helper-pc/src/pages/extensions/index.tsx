import {
  Tabs, TabList, Tab, TabPanel, TabPanels,
} from "@chakra-ui/react";
import Downloaded from "@/pages/extensions/Downloaded.tsx";

export function ExtensionsPage() {
  return (
    <Tabs isLazy>
      <TabList
        style={{position: 'fixed', top: 0, left: '64px'}}
        bg='white'
      >
        <Tab>已安装</Tab>
        <Tab>已下载</Tab>
        <Tab>浏览插件</Tab>
      </TabList>

      <TabPanels style={{marginTop: '30px'}}>
        <TabPanel><Downloaded/></TabPanel>
        <TabPanel>
          <p>two!</p>
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
