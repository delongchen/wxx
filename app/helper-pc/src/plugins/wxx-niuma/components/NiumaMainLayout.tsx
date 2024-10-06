import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useNiumaContext } from '../context/hooks';
import NiumaHeader from '../components/header/NiumaHeader.tsx';

const NiumaContent = () => {
  const { theme } = useNiumaContext();
  const bg = [theme, 100].join('.');

  return (
    <Box w="100vw" minH="100vh" bg={bg} pt="64px">
      <Outlet />
    </Box>
  );
};

function NiumaMainLayout() {
  return (
    <>
      <NiumaHeader />
      <NiumaContent />
    </>
  );
}

export default NiumaMainLayout;
