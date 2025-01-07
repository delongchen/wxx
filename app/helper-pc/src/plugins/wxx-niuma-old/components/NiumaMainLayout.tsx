import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import NiumaHeader from '../components/header/NiumaHeader.tsx';
import { use } from 'react';
import { NiumaContext } from '../context/niuma';

const NiumaContent = () => {
  const { theme } = use(NiumaContext);
  const bg = [theme, 100].join('.');

  return (
    <Box minH="100vh" bg={bg} pt="64px">
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
