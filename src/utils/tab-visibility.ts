import { useEffect, useRef } from "react";

/**
 * Hook that detects when a component becomes visible 
 * (either through tab switch or being scrolled into view)
 * and triggers a refresh function
 */
export function useTabVisibility(options: {
  elementId: string;
  onVisible: () => void;
  threshold?: number;
  debounceMs?: number;
}) {
  const { elementId, onVisible, threshold = 0.1, debounceMs = 500 } = options;
  const lastRefreshTime = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    // Skip the first render to avoid double loading
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // When tab becomes visible in the parent Tabs component, the component renders
    // This helps refresh data when switching back to this tab
    const refreshData = () => {
      const now = Date.now();
      
      // Debounce refreshes to avoid multiple rapid calls
      if (now - lastRefreshTime.current < debounceMs) {
        return;
      }
      
      if (document.visibilityState === 'visible') {
        console.log(`Tab ${elementId} is visible, refreshing data`);
        lastRefreshTime.current = now;
        onVisible();
      }
    };
    
    // Use intersection observer to detect when the component is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            refreshData();
          }
        });
      },
      { threshold }
    );
    
    // Start observing the component
    const element = document.getElementById(elementId);
    if (element) {
      observer.observe(element);
    }
    
    // Also listen for visibility changes (when user switches tabs in browser)
    document.addEventListener('visibilitychange', refreshData);
    
    return () => {
      // Clean up
      if (element) {
        observer.unobserve(element);
      }
      document.removeEventListener('visibilitychange', refreshData);
    };
  }, [elementId, onVisible, threshold, debounceMs]);
}