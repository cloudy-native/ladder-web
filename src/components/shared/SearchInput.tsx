import { Button, Flex, Icon, Input } from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";

interface SearchInputProps {
  /**
   * Current search value
   */
  value: string;
  
  /**
   * Function called when search value changes
   */
  onChange: (value: string) => void;
  
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  
  /**
   * Optional additional styling
   */
  className?: string;
}

/**
 * A standardized search input with clear button
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className
}: SearchInputProps) {
  return (
    <Flex gap={4} alignItems="center" className={className}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        flex="1"
        bg="white"
      />
      {value && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <Icon as={IoClose} />
        </Button>
      )}
    </Flex>
  );
}