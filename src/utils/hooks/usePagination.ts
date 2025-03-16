import { useEffect, useState } from "react";
import { PAGE_SIZE } from "../constants";

export function usePagination<T>(items: T[], itemsPerPage: number = PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    firstItemIndex: (currentPage - 1) * itemsPerPage,
    lastItemIndex: Math.min(currentPage * itemsPerPage, items.length) - 1,
    totalItems: items.length,
  };
}
