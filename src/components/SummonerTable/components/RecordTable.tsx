import React from "react";
import {
  EnhanceLolSummonerSummoner,
  LolGameSessionTeam,
} from "../../../types/data.ts";

import {
  Skeleton,
  Stack,
  Text,
  StatHelpText,
  StatLabel,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Box,
  Flex,
} from "@chakra-ui/react";
import { GameNameMap } from "../../../constant/game.ts";
import { getCurrentRecord, getSummonerName } from "../../../utils/index.ts";

export interface RecordTableProps {
  data?: (EnhanceLolSummonerSummoner | LolGameSessionTeam)[];
}

const PlaceHolder = () => {
  return (
    <Stack width="100%">
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
    </Stack>
  );
};

const renderRow = (data: EnhanceLolSummonerSummoner | LolGameSessionTeam) => {
  const record = getCurrentRecord(data.matchHistory);
  return (
    <Tr key={data.summonerId}>
      <Td>{getSummonerName(data)}</Td>
      <Td>
        <Flex gap="2">
          {record?.match.map(({ record, type }, index) => (
            <Flex key={`${data.summonerId}_${index}`} flexDirection="column">
              <Box>{record}</Box>
              <Badge colorScheme="green">{type && GameNameMap[type]}</Badge>
            </Flex>
          ))}
        </Flex>
      </Td>
      <Td>{record?.KDA}</Td>
    </Tr>
  );
};

export const RecordTable: React.FC<RecordTableProps> = ({ data }) => {
  return (
    <TableContainer>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Player</Th>
            <Th>Reccent record</Th>
            <Th>KDA</Th>
          </Tr>
        </Thead>
        <Tbody>{data?.map(renderRow)}</Tbody>
      </Table>
      {!data && <PlaceHolder />}
    </TableContainer>
  );
};
