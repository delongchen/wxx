import { useContext } from 'react';
import { NiumaContext } from './ctx';

export const useNiumaContext = () => {
  return useContext(NiumaContext);
};
