import { memo, useCallback, useContext } from 'react';
import { Flex, IconButton, Spacer, Box, Button, ButtonGroup } from '@chakra-ui/react';
import Style from './NiumaHeader.module.sass';
import { useNavigate } from 'react-router-dom';
import { VscArrowLeft } from 'react-icons/vsc';
import { NiumaContext } from './context';

interface NiumaHeaderProps {
  activeKey?: string;
  items?: { key: string; text: string }[];
  showButtons?: boolean;
  onButtonClick?: (key: string) => void;
}

function NiumaHeader(props: NiumaHeaderProps) {
  const { activeKey = '', items = [], showButtons = true, onButtonClick } = props;

  const { theme } = useContext(NiumaContext);
  const bg = [theme, 600].join('.');

  const navigate = useNavigate();
  const handleBack = useCallback(() => {
    navigate('/', { replace: true });
  }, []);

  const handleButtonClick = useCallback(
    (key: string) => {
      if (onButtonClick !== undefined) {
        onButtonClick(key);
      }
    },
    [onButtonClick],
  );

  return (
    <Flex className={Style.container} alignItems="center" bg={bg}>
      <IconButton
        aria-label="back"
        onClick={handleBack}
        colorScheme={theme}
        icon={<VscArrowLeft size="24px" />}
      />
      <Spacer />
      <ButtonGroup>
        {showButtons &&
          items.map((item) => (
            <Button
              key={item.key}
              colorScheme={item.key === activeKey ? theme : 'whiteAlpha'}
              variant={item.key === activeKey ? 'solid' : 'outline'}
              onClick={() => handleButtonClick(item.key)}
            >
              {item.text}
            </Button>
          ))}
      </ButtonGroup>
      <Spacer />
      <Box width="24px" />
    </Flex>
  );
}

export default memo(NiumaHeader);
