import { Box } from '@chakra-ui/react';
import { memo } from 'react';
import { getPlugins } from '@/app/plugin/manager.ts';
import ExtensionCard from './ExtensionCard.tsx'
import Style from './index.module.sass'


function ExtensionsPage() {
  const extensions = getPlugins()

  return (
    <Box className={Style.container}>
      {extensions.map(ctx => (
        <ExtensionCard key={ctx.name} ctx={ctx}/>
      ))}
    </Box>
  )
}

export default memo(ExtensionsPage);
