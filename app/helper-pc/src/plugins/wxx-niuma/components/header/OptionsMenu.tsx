import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { AddIcon, EditIcon, ExternalLinkIcon, HamburgerIcon, RepeatIcon } from '@chakra-ui/icons';
import { useNiumaContext } from '../../context/hooks';

function OptionsMenu() {
  const { theme } = useNiumaContext();

  return (
    <Menu colorScheme={theme}>
      <MenuButton
        as={IconButton}
        aria-label="options"
        colorScheme={theme}
        icon={<HamburgerIcon />}
      />
      <MenuList>
        <MenuItem icon={<AddIcon />} command="⌘T">
          New Tab
        </MenuItem>
        <MenuItem icon={<ExternalLinkIcon />} command="⌘N">
          New Window
        </MenuItem>
        <MenuItem icon={<RepeatIcon />} command="⌘⇧N">
          Open Closed Tab
        </MenuItem>
        <MenuItem icon={<EditIcon />} command="⌘O">
          Open File...
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

export default OptionsMenu;
