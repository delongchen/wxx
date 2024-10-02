import { WxxPluginContext, WxxPluginStatus } from '@/app/plugin/types';
import { useAppTheme } from '@/app/context/app-context.tsx';
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Text,
} from '@chakra-ui/react';
import { memo, useState } from 'react';
import { useSubscribe } from '@/utils/rx';

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

function ExtensionCard(props: ExtensionCardProp) {
  const theme = useAppTheme();
  const { ctx } = props;
  const { version, cover, description } = ctx.getInfo();
  const { statusSubject, start, shutdown, restart } = ctx;

  const [pluginStatus, setPluginStatus] = useState<WxxPluginStatus>(statusSubject.getValue());
  useSubscribe(statusSubject, setPluginStatus);

  const [badgeColor, badgeText] = mapPluginStatus(pluginStatus);

  return (
    <Card colorScheme={theme} mb="4">
      <CardHeader>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name={ctx.name} src={cover} />
            <Box>
              <Text fontWeight="bold">
                {ctx.name}
                <Badge ml="1" colorScheme={badgeColor}>
                  {badgeText}
                </Badge>
              </Text>
              {version && <Text>v{version}</Text>}
            </Box>
          </Flex>
          <ButtonGroup>
            {pluginStatus === WxxPluginStatus.Stopped && (
              <Button variant="ghost" colorScheme="green" onClick={start}>
                启用
              </Button>
            )}
            {pluginStatus === WxxPluginStatus.Started && (
              <Button variant="ghost" colorScheme="gray" onClick={restart}>
                重新加载
              </Button>
            )}
            {pluginStatus === WxxPluginStatus.Started && (
              <Button variant="ghost" colorScheme="red" onClick={shutdown}>
                停用
              </Button>
            )}
          </ButtonGroup>
        </Flex>
      </CardHeader>

      {description.length !== 0 && (
        <CardBody>
          {description.map((line, index) => (
            <Text key={index}>{line}</Text>
          ))}
        </CardBody>
      )}
    </Card>
  );
}

export default memo(ExtensionCard);
