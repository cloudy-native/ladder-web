import { Button, Card, Heading, Icon, Table } from "@chakra-ui/react";
import { IoTrash } from "react-icons/io5";
import { ReactNode } from "react";

interface EntityCardProps {
  title: string;
  isLoading: boolean;
  onDelete: () => void;
  deleteButtonText: string;
  children: ReactNode;
  columnHeaders: { key: string; label: string; width?: string }[];
}

/**
 * A reusable card component for displaying entity data in admin interfaces
 */
export function EntityCard({
  title,
  isLoading,
  onDelete,
  deleteButtonText,
  children,
  columnHeaders,
}: EntityCardProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{title}</Heading>
      </Card.Header>
      <Card.Body>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {columnHeaders.map((header) => (
                <Table.ColumnHeader key={header.key} width={header.width}>
                  {header.label}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>{children}</Table.Body>
        </Table.Root>
      </Card.Body>
      <Card.Footer>
        <Button
          loading={isLoading}
          onClick={onDelete}
          disabled={isLoading}
        >
          <Icon as={IoTrash} mr={2} />
          {deleteButtonText}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}