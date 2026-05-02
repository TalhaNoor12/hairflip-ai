import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to detect if an element is in view using the Intersection Observer API.
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.RefObject, boolean]} - [ref, isVisible]
 */
export default function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Use a stringified version of options as a dependency if options are provided,
  // or use an empty dependency array if options aren't expected to change.
  // This prevents the observer from being recreated on every render if an inline
  // object is passed.
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Once it becomes visible, we set isVisible to true and stay that way.
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Important: Stop observing once we've seen it if you want it to stay visible.
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { 
      threshold: 0.15, 
      ...options 
    });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [optionsKey]); // Stable dependency

  return [ref, isVisible];
}
