import { memo } from 'react';
import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import Style from './index.module.sass';
import TikTokHelper from '../../components/tik-tok-helper.tsx';

function Page() {
  return (
    <>
      <Box className={Style.container}>
        <Box className={Style.heading}>
          <Heading>吴翔翔的神奇工具箱</Heading>
          <Text>WXX`s Magical Toolbox</Text>
        </Box>

        <Stack>
          <TikTokHelper />
        </Stack>
      </Box>
    </>
  );
}

export default memo(Page);
