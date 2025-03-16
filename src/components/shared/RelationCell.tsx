import { isPromise } from "@/utils";
import { Table, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

/**
 * Generic component to handle fetching and displaying relation data
 */
// TODO: errors is GraphQLFormattedError
//
interface RelationCellProps<T> {
  fetchRelation: () =>
    | Promise<{ data?: T | null; errors?: any[] }>
    | { data?: T | null; errors?: any[] };
  renderData: (
    data: T | null | undefined
  ) => React.ReactNode | Promise<React.ReactNode>;
  loadingElement?: React.ReactNode;
  errorElement?: React.ReactNode;
}

export function RelationCell<T>({
  fetchRelation,
  renderData,
  loadingElement = "Loading...",
  errorElement = "Error",
}: RelationCellProps<T>) {
  const [data, setData] = useState<T | null | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  // Create a stable reference to fetchRelation to prevent infinite loops
  const stableFetchRelation = useCallback(fetchRelation, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isMounted) return;

      setLoading(true);
      setError(false);

      try {
        const result = stableFetchRelation();

        // TODO: errors is of type GraphQLFormattedError
        //
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        if (isPromise(result)) {
          const response = await result;
          if (!isMounted) return;

          if (response.errors) {
            setError(true);
          } else {
            setData(response.data);
          }
        } else {
          if (!isMounted) return;
          setData(result.data);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching relation:", err);
        setError(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [stableFetchRelation]);

  const [renderedData, setRenderedData] = useState<React.ReactNode>(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderError, setRenderError] = useState(false);

  // Handle async rendering
  useEffect(() => {
    if (loading || error) return;

    let isMounted = true;
    setRenderLoading(true);

    const renderAsync = async () => {
      try {
        const rendered = renderData(data);

        if (isPromise(rendered)) {
          const result = await rendered;
          if (isMounted) {
            setRenderedData(result);
          }
        } else {
          if (isMounted) {
            setRenderedData(rendered);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error rendering data:", err);
          setRenderError(true);
        }
      } finally {
        if (isMounted) {
          setRenderLoading(false);
        }
      }
    };

    renderAsync();

    return () => {
      isMounted = false;
    };
  }, [data, loading, error, renderData]);

  if (loading || renderLoading) {
    return <Table.Cell>{loadingElement}</Table.Cell>;
  }

  if (error || renderError) {
    return <Table.Cell>{errorElement}</Table.Cell>;
  }

  return <Table.Cell>{renderedData}</Table.Cell>;
}

/**
 * Simplified version that just returns the Text component
 * instead of wrapping in a Table.Cell - useful for other contexts
 */
export function RelationData<T>({
  fetchRelation,
  renderData,
  loadingElement = "Loading...",
  errorElement = "Error",
}: RelationCellProps<T>) {
  const [data, setData] = useState<T | null | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  // Create a stable reference to fetchRelation to prevent infinite loops
  const stableFetchRelation = useCallback(fetchRelation, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isMounted) return;

      setLoading(true);
      setError(false);

      try {
        const result = stableFetchRelation();

        // TODO: errors is of type GraphQLFormattedError, but that's not easy to import
        //
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
        if (isPromise(result)) {
          const response = await result;
          if (!isMounted) return;

          if (response.errors) {
            setError(true);
          } else {
            setData(response.data);
          }
        } else {
          if (!isMounted) return;
          setData(result.data);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching relation:", err);
        setError(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [stableFetchRelation]);

  const [renderedData, setRenderedData] = useState<React.ReactNode>(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderError, setRenderError] = useState(false);

  // Handle async rendering
  useEffect(() => {
    if (loading || error) return;

    let isMounted = true;
    setRenderLoading(true);

    const renderAsync = async () => {
      try {
        const rendered = renderData(data);

        if (isPromise(rendered)) {
          const result = await rendered;
          if (isMounted) {
            setRenderedData(result);
          }
        } else {
          if (isMounted) {
            setRenderedData(rendered);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error rendering data:", err);
          setRenderError(true);
        }
      } finally {
        if (isMounted) {
          setRenderLoading(false);
        }
      }
    };

    renderAsync();

    return () => {
      isMounted = false;
    };
  }, [data, loading, error, renderData]);

  if (loading || renderLoading) {
    return <Text>{loadingElement}</Text>;
  }

  if (error || renderError) {
    return <Text color="red.500">{errorElement}</Text>;
  }

  return <>{renderedData}</>;
}
