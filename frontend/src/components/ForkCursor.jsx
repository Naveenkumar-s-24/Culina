import React, { useEffect, useRef, useState } from 'react';

const ForkCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const pos = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });
    const speed = 0.2; // Smoothing factor (0.1 to 1)

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isVisible) setIsVisible(true);
            target.current.x = e.clientX;
            target.current.y = e.clientY;
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        const handleHoverStart = (e) => {
            const target = e.target;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleHoverStart);
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        document.documentElement.addEventListener('mouseenter', handleMouseEnter);

        const animate = () => {
            pos.current.x += (target.current.x - pos.current.x) * speed;
            pos.current.y += (target.current.y - pos.current.y) * speed;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${isHovering ? '15deg' : '0deg'}) scale(${isHovering ? 1.2 : 1})`;
            }
            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleHoverStart);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(animId);
        };
    }, [isHovering, isVisible]);

    if (!isVisible) return null;

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '32px',
                height: '32px',
                pointerEvents: 'none',
                zIndex: 10000,
                marginLeft: '-16px',
                marginTop: '-16px',
                transition: 'transform 0.1s ease-out, opacity 0.3s ease',
                opacity: isVisible ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316', // Using the accent color from the dashboard
                filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))',
            }}
        >
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Fork Base */}
                <path d="M12 12v10" />
                {/* Fork Prongs container */}
                <path d="M18 12c0-4.5-2.5-7.5-6-7.5s-6 3-6 7.5" />
                {/* Individual Prongs */}
                <path d="M6 12V3" />
                <path d="M10 12V2" />
                <path d="M14 12V2" />
                <path d="M18 12V3" />
            </svg>
        </div>
    );
};

export default ForkCursor;
