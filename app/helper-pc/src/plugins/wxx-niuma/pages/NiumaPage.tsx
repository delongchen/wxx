import { memo } from 'react';
import { useNiumaContext } from '../context/hooks';

function NiumaPage() {
  const { theme } = useNiumaContext();

  return (
    <div>
      <p>{theme}</p>
    </div>
  );
}

export default memo(NiumaPage);
