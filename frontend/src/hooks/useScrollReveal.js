import { useEffect, useRef } from 'react';

export function useScrollReveal(options = {}, deps = []) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (options.once) {
                        observer.unobserve(entry.target);
                    }
                } else if (!options.once) {
                    entry.target.classList.remove('visible');
                }
            });
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || "0px 0px -50px 0px"
        });

        const elements = containerRef.current.querySelectorAll('.scroll-reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [options.once, options.threshold, options.rootMargin, ...deps]);

    return containerRef;
}
