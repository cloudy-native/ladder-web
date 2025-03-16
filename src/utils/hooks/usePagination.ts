import { PAGE_SIZE } from "@/utils/constants";
import { useEffect, useState } from "react";

/**
 * A custom hook that provides pagination functionality for a given array of items.
 *
 * @template T The type of items in the array.
 * @param items The array of items to paginate.  Must not be null or undefined.
 * @param itemsPerPage The number of items to display per page. Defaults to PAGE_SIZE from constants.ts.
 * @returns An object containing pagination information: currentPage, setCurrentPage, totalPages, paginatedItems, firstItemIndex, lastItemIndex, and totalItems.
 */
export function usePagination<T>(items: T[], itemsPerPage: number = PAGE_SIZE) {
  // State variable to track the current page number
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages based on the number of items and items per page
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Slice the items array to get the items for the current page
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Effect hook to reset the current page to 1 whenever the number of items changes
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page when items change
  }, [items.length]); // Only run when items.length changes

  // Return an object containing pagination information
  return {
    currentPage, // The current page number
    setCurrentPage, // Function to update the current page number
    totalPages, // The total number of pages
    paginatedItems, // The items for the current page
    firstItemIndex: (currentPage - 1) * itemsPerPage, // Index of the first item on the current page
    lastItemIndex: Math.min(currentPage * itemsPerPage, items.length) - 1, // Index of the last item on the current page
    totalItems: items.length, // The total number of items
  };
}
