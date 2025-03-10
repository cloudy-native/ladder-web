import { Table, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface RelationTableCellProps<T, R> {
  /**
   * The entity that has the relation
   */
  entity: T;
  
  /**
   * A key to use for dependency tracking in useEffect
   */
  dependencyKey: string | string[];
  
  /**
   * Function to fetch related data
   */
  fetchRelation: () => Promise<R | null | R[]>;
  
  /**
   * Function to render the content when data is loaded
   */
  renderContent: (data: R | null | R[]) => React.ReactNode;
}

/**
 * A reusable component for displaying related data in a table cell
 * with loading and error states handled automatically
 */
export function RelationTableCell<T, R>({
  entity,
  dependencyKey,
  fetchRelation,
  renderContent
}: RelationTableCellProps<T, R>) {
  const [data, setData] = useState<R | null | R[]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Convert dependencyKey to array for useEffect dependencies
  const dependencies = Array.isArray(dependencyKey) 
    ? dependencyKey 
    : [dependencyKey];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await fetchRelation();
        setData(result);
      } catch (err) {
        console.error("Error fetching relation data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  if (loading) {
    return <Table.Cell><Text>Loading...</Text></Table.Cell>;
  }

  if (error) {
    return <Table.Cell><Text color="red.500">Error</Text></Table.Cell>;
  }

  return <Table.Cell>{renderContent(data)}</Table.Cell>;
}