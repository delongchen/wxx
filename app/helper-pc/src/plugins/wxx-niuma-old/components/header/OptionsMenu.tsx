import { NiumaContext } from '../../context/niuma'
import { use } from 'react'

function OptionsMenu() {
  const { theme } = use(NiumaContext);

  return (
    <div>{theme}</div>
  );
}

export default OptionsMenu;
