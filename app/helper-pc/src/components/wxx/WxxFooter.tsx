import { Box } from '@chakra-ui/react';
import Style from './wxx.module.sass';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';
import { StatusBarItems } from '@/app/status-bar';

export function WxxFooter() {
  const globalState = useAppSelector(selectGlobal);
  const bg = [globalState.theme, 300].join('.');

  return (
    <Box className={Style.footer} bg={bg}>
      {StatusBarItems.map((Item, index) => (
        <Item key={index} />
      ))}
    </Box>
  );
}
