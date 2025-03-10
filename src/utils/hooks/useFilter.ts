import { useState, useCallback, useMemo } from 'react';

export function useFilter<T>(items: T[], filterFn: (item: T, filterText: string) => boolean) {
  const [filterText, setFilterText] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!filterText.trim()) return items;
    return items.filter(item => filterFn(item, filterText.toLowerCase()));
  }, [items, filterText, filterFn]);
  
  const clearFilter = useCallback(() => {
    setFilterText('');
  }, []);
  
  return {
    filterText,
    setFilterText,
    filteredItems,
    clearFilter
  };
}