import { useAppDispatch, useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';
import { selectWxxPower, setStateAsync } from '@/store/modules/wxx-power';
import { memo, useCallback, useId } from 'react';
import {
  Card,
  Heading,
} from '@chakra-ui/react';
import { Switch } from '@/components/ui/switch'

function TikTokHelper() {
  const { theme } = useAppSelector(selectGlobal);
  const dispatch = useAppDispatch();

  const { autoAcceptMatch, autoNextMatch, autoBallot } = useAppSelector(selectWxxPower);

  const AutoAcceptID = useId()
  const AutoNextMatchID = useId()
  const AutoBallotID = useId()

  const handleSwitch = useCallback((id: string) => {
    if (id === AutoAcceptID) {
      dispatch(
        setStateAsync((prev) => ({
          autoAcceptMatch: !prev.autoAcceptMatch,
        })),
      );
    } else if (id === AutoNextMatchID) {
      dispatch(
        setStateAsync((prev) => ({
          autoNextMatch: !prev.autoNextMatch,
        })),
      );
    } else if (id === AutoBallotID) {
      dispatch(
        setStateAsync((prev) => ({
          autoBallot: !prev.autoBallot,
        })),
      );
    }
  }, []);

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">刷抖音助手</Heading>
      </Card.Header>

      <Card.Body>
        <Switch
          checked={autoAcceptMatch}
          colorScheme={theme}
          onCheckedChange={() => { handleSwitch(AutoAcceptID) }}
        >自动接受对局</Switch>

        <Switch
          checked={autoNextMatch}
          colorScheme={theme}
          onCheckedChange={() => { handleSwitch(AutoNextMatchID) }}
        >自动下一局</Switch>

        <Switch
          checked={autoBallot}
          colorScheme={theme}
          onCheckedChange={() => { handleSwitch(AutoBallotID) }}
        >自动投票</Switch>
      </Card.Body>
    </Card.Root>
  );
}

export default memo(TikTokHelper);
