import { memo, useCallback } from 'react';
import Style from './index.module.sass';
import { Card, Heading, Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
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
    <Card.Root>
      <Card.Header>
        <Heading size="xl">主题颜色</Heading>
      </Card.Header>
      <Card.Body>
        {AllowColor.map((it) => (
          <Button key={it} colorScheme={it} onClick={() => handleClick(it)}>
            {it}
          </Button>
        ))}
      </Card.Body>
    </Card.Root>
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
