import { Flex, Icon, Table } from "@chakra-ui/react";
import { IoKey } from "react-icons/io5";
import { Tooltip } from "../ui/tooltip"

interface IdCellProps {
  id: string;
  entityType: 'ladder' | 'player' | 'team';
}

/**
 * Display an entity ID in a table cell with a key icon and tooltip
 */
export function IdCell({ id, entityType }: IdCellProps) {
  return (
    <Table.Cell width="60px">
      <Tooltip content={id}>
        <Flex alignItems="center" justifyContent="center">
          <Icon as={IoKey} color="gray.500" boxSize={5} />
        </Flex>
      </Tooltip>
    </Table.Cell>
  );
}