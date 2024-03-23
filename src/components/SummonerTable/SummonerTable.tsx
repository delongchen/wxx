import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import React from "react";

export const SummonerTable: React.FC = () => {
  return (
    <TableContainer>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Player</Th>
            <Th>Reccent record</Th>
            <Th>KDA</Th>
          </Tr>
        </Thead>
        <Tbody></Tbody>
      </Table>
    </TableContainer>
  );
};
