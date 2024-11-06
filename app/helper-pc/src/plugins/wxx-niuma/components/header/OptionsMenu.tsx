import { useNiumaContext } from '../../context/hooks';

function OptionsMenu() {
  const { theme } = useNiumaContext();

  return (
    <div>{theme}</div>
  );
}

export default OptionsMenu;
