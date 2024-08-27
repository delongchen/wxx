import { memo, useCallback } from 'react';
import Style from './index.module.sass';
import { Card, CardBody, CardHeader, Heading, Box, Wrap, WrapItem, Button } from '@chakra-ui/react';
import { setGlobalThemeAsync } from '@/store/modules/global';
import { useAppDispatch } from '@/store';

const AllowColor = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
];

function ThemeSetting() {
  const dispatch = useAppDispatch();

  const handleClick = useCallback((theme: string) => {
    dispatch(setGlobalThemeAsync(theme));
  }, []);

  return (
    <Card>
      <CardHeader>
        <Heading size="xl">主题颜色</Heading>
      </CardHeader>
      <CardBody>
        <Wrap spacing={4}>
          {AllowColor.map(it => (
            <WrapItem key={it}>
              <Button colorScheme={it} onClick={() => handleClick(it)}>
                {it}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </CardBody>
    </Card>
  );
}

function SettingsPage() {
  return (
    <Box className={Style.container}>
      <ThemeSetting />
    </Box>
  );
}

export default memo(SettingsPage);
