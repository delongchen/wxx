import { Flex, IconButton, Spacer, Button, Group } from '@chakra-ui/react';
import { VscArrowLeft } from 'react-icons/vsc';
import { useLocation, useNavigate } from 'react-router-dom';
import OptionsMenu from './OptionsMenu.tsx';
import { mainPageChildren } from '../../routes';
import { use } from 'react';
import { NiumaContext } from '../../context/niuma';

function CenterButtonGroup() {
  const { theme } = use(NiumaContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [, pluginName, pageName] = location.pathname.split('/');
  const rootPath = ['', pluginName, pageName].join('/');

  return (
    <Group>
      {mainPageChildren.map((child) => {
        const { meta = {}, name } = child;
        const text = (meta['text'] as string) ?? '';
        const path = child.isIndexPage ? rootPath : [rootPath, name].join('/');
        const activating = location.pathname === path;

        return (
          <Button
            key={name}
            colorPalette={theme}
            variant={activating ? 'solid' : 'ghost'}
            onClick={() => {
              if (!activating) {
                navigate(path, { replace: true });
              }
            }}
          >
            {text}
          </Button>
        );
      })}
    </Group>
  );
}

function NiumaHeader() {
  const { theme } = use(NiumaContext);

  const bg = [theme, 400].join('.');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  return (
    <Flex
      position="fixed"
      zIndex={1000}
      left="0"
      right="0"
      top="0"
      h="64px"
      bg={bg}
      pl="2"
      pr="2"
      alignItems="center"
      justifyContent="center"
    >
      <IconButton
        aria-label="back"
        onClick={handleBack}
        colorPalette={theme}
        variant="ghost"
      >
        <VscArrowLeft size="24px" />
      </IconButton>
      <Spacer>
        <Flex alignItems="center" justifyContent="center" h="100%">
          <CenterButtonGroup />
        </Flex>
      </Spacer>
      <OptionsMenu />
    </Flex>
  );
}

export default NiumaHeader;
