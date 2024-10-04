import { Flex, IconButton, Spacer, ButtonGroup, Button } from '@chakra-ui/react';
import { useNiumaContext } from '../../context/hooks';
import { VscArrowLeft } from 'react-icons/vsc';
import { useLocation, useNavigate } from 'react-router-dom';
import OptionsMenu from './OptionsMenu.tsx';
import { mainPageChildren } from '../../routes';

function CenterButtonGroup() {
  const { theme } = useNiumaContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [, pluginName, pageName] = location.pathname.split('/');
  const rootPath = ['', pluginName, pageName].join('/');

  return (
    <ButtonGroup>
      {mainPageChildren.map((child) => {
        const { meta = {}, name } = child;
        const text = (meta['text'] as string) ?? '';
        const path = child.isIndexPage ? rootPath : [rootPath, name].join('/');
        const activating = location.pathname === path;

        return (
          <Button
            key={name}
            isActive={activating}
            colorScheme={theme}
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
    </ButtonGroup>
  );
}

const LightThemeSet = new Set(['yellow', 'cyan'])

function NiumaHeader() {
  const { theme } = useNiumaContext();

  const bg = [theme, LightThemeSet.has(theme) ? 400 : 500].join('.');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  const buttonVariant = theme === 'gray' ? 'ghost' : 'solid';

  return (
    <Flex
      position="fixed"
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
        colorScheme={theme}
        variant={buttonVariant}
        icon={<VscArrowLeft size="24px" />}
      />
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
