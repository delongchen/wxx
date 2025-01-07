import { memo } from 'react';
import { Tag } from '@/components/ui/tag';
import { VscInfo, VscError, VscEllipsis } from 'react-icons/vsc';
import { IconType } from 'react-icons';
import { useCurrentSummoner, useLcuProcessStatus } from 'tauri-plugin-wxx-core/hooks';
import { LcuProcessStatus } from 'tauri-plugin-wxx-core/events';

type TagAllowedColor = 'red' | 'green' | 'yellow';

interface BaseTagProps {
  color: TagAllowedColor;
  text: string;
  icon?: IconType;
}

const BaseTag = ({ color, text, icon: Icon }: BaseTagProps) => (
  <Tag
    size="md"
    colorPalette={color}
    startElement={Icon === undefined ? null : <Icon />}
  >
    {text}
  </Tag>
);

const RedTag = <BaseTag color="red" text="上号GKD" icon={VscError} />;
const YellowTag = <BaseTag color="yellow" text="请使用管理员权限启动" icon={VscInfo} />;

function LcuStatusTag() {
  const { status } = useLcuProcessStatus();
  const currentSummoner = useCurrentSummoner();

  if (status === LcuProcessStatus.NotStarted) return RedTag;
  if (status === LcuProcessStatus.NotStartedWithAdmin) return YellowTag;

  if (currentSummoner === null) {
    return <BaseTag color="green" text="" icon={VscEllipsis} />;
  }

  const { gameName, tagLine } = currentSummoner;
  const text = `${gameName}#${tagLine}`;

  return <BaseTag color="green" text={text} />;
}

export default memo(LcuStatusTag);
