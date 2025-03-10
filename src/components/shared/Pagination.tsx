import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";

interface PaginationProps {
  /**
   * Current page number (1-based)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Function to change the page
   */
  onPageChange: (page: number) => void;

  /**
   * Total number of items across all pages
   */
  totalItems: number;

  /**
   * Index of the first item on the current page (0-based)
   */
  firstItemIndex: number;

  /**
   * Index of the last item on the current page (0-based)
   */
  lastItemIndex: number;

  /**
   * Optional label for the items being paginated (e.g., "teams", "players")
   */
  itemLabel?: string;
}

/**
 * A standardized pagination component for use across the application
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  firstItemIndex,
  lastItemIndex,
  itemLabel = "items",
}: PaginationProps) {
  return (
    <Box py={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.600">
          Showing {firstItemIndex + 1}-{Math.min(lastItemIndex + 1, totalItems)}{" "}
          of {totalItems} {itemLabel}
        </Text>

        <HStack>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).map((_, index) => {
            // Only show a window of 5 pages around current page
            if (
              index + 1 === 1 || // Always show first page
              index + 1 === totalPages || // Always show last page
              (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1) // Show neighboring pages
            ) {
              return (
                <Button
                  key={index}
                  size="sm"
                  variant={currentPage === index + 1 ? "solid" : "outline"}
                  onClick={() => onPageChange(index + 1)}
                  colorScheme={currentPage === index + 1 ? "blue" : undefined}
                >
                  {index + 1}
                </Button>
              );
            }

            // Show ellipsis for gaps in the pagination
            if (
              (index + 1 === currentPage - 2 && currentPage > 3) ||
              (index + 1 === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return <Text key={index}>...</Text>;
            }

            return null;
          })}

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
