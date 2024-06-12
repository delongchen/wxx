import {
  CircularProgress,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';
import React from 'react';
import { match } from 'ts-pattern';
import { LcuClientStateType } from '../../constant';

export const LcuClientStatus: React.FC<{
  state: LcuClientStateType;
}> = ({ state }) => {
  return (
    <>
      <Popover trigger="hover">
        <PopoverTrigger>
          <CircularProgress
            marginLeft={2}
            size="24px"
            {...match(state)
              .with(LcuClientStateType.Connecting, () => ({
                isIndeterminate: true,
                color: 'orange.400',
              }))
              .with(LcuClientStateType.Connected, () => ({
                value: 100,
                color: 'green.300',
              }))
              .otherwise(() => ({}))}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            {match(state)
              .with(
                LcuClientStateType.Connecting,
                () => 'Connecting to League of Legends client'
              )
              .with(
                LcuClientStateType.Connected,
                () => 'League of Legends client connected successfully'
              )
              .otherwise(
                () => 'League of Legends client connect status is unknown'
              )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
};
