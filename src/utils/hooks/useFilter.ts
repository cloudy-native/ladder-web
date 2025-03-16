import { useCallback, useMemo, useState } from "react";

/**
 * A custom hook for filtering a list of items based on a search text.
 *
 * @param items - The array of items to filter.
 * @param filterFn - A function that determines whether an item should be included in the filtered list.
 *                   It takes an item and the filter text as arguments and returns a boolean.
 * @returns An object containing the filter text, a function to set the filter text,
 *          the filtered items, and a function to clear the filter.
 */
export function useFilter<T>(
  items: T[],
  filterFn: (item: T, filterText: string) => boolean
) {
  /**
   * The current filter text.
   */
  const [filterText, setFilterText] = useState("");

  /**
   * The filtered list of items, memoized to avoid unnecessary recalculations.
   */
  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return items;
    return items.filter((item) => filterFn(item, filterText.toLowerCase()));
  }, [items, filterText, filterFn]);

  /**
   * A function to clear the filter text.
   */
  const clearFilter = useCallback(() => {
    setFilterText("");
  }, []);

  return {
    filterText,
    setFilterText,
    filteredItems,
    clearFilter,
  };
}
