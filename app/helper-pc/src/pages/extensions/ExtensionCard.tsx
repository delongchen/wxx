import { WxxPluginContext, WxxPluginStatus } from '@/app/plugin/types';
import { AppContext } from '@/app/context/app-context.tsx';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Badge,
  Box,
  Card,
  Flex,
  Text,
  Group,
} from '@chakra-ui/react';
import { memo, useState, use } from 'react';
import { useSubscribe } from 'tauri-plugin-wxx-core/hooks';

interface ExtensionCardProp {
  ctx: WxxPluginContext<unknown>;
}

const mapPluginStatus = (status: WxxPluginStatus): [string, string] => {
  switch (status) {
    case WxxPluginStatus.Started:
      return ['green', '已启用'];
    case WxxPluginStatus.Stopped:
      return ['red', '已停用'];
    default:
      return ['yellow', '正在操作'];
  }
};

function ExtensionCard({ ctx }: ExtensionCardProp) {
  const { theme } = use(AppContext);
  const { version, cover, description } = ctx.getInfo();
  const { statusSubject, start, shutdown, restart } = ctx;

  const [pluginStatus, setPluginStatus] = useState<WxxPluginStatus>(statusSubject.getValue());

  useSubscribe(statusSubject, setPluginStatus);

  const [badgeColor, badgeText] = mapPluginStatus(pluginStatus);

  return (
    <Card.Root colorScheme={theme} mb="4">
      <Card.Header>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name={ctx.name} src={cover} />
            <Box>
              <Text fontWeight="bold">
                {ctx.name}
                <Badge ml="1" colorPalette={badgeColor}>
                  {badgeText}
                </Badge>
              </Text>
              {version && <Text>v{version}</Text>}
            </Box>
          </Flex>
          <Group>
            {pluginStatus === WxxPluginStatus.Stopped && (
              <Button variant="solid" colorPalette="green" onClick={start}>
                启用
              </Button>
            )}
            {pluginStatus === WxxPluginStatus.Started && (
              <Button variant="ghost" colorPalette="gray" onClick={restart}>
                重新加载
              </Button>
            )}
            {pluginStatus === WxxPluginStatus.Started && (
              <Button variant="solid" colorPalette="red" onClick={shutdown}>
                停用
              </Button>
            )}
          </Group>
        </Flex>
      </Card.Header>

      {description.length !== 0 && (
        <Card.Body>
          {description.map((line, index) => (
            <Text key={index}>{line}</Text>
          ))}
        </Card.Body>
      )}
    </Card.Root>
  );
}

export default memo(ExtensionCard);
