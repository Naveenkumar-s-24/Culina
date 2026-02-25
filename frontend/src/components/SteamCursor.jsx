import React, { useEffect, useRef } from 'react';

const SteamCursor = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: 0, y: 0, moved: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const MAX_PARTICLES = 50;

        const createParticle = (x, y) => {
            return {
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 1.2,
                vy: -Math.random() * 1.5 - 0.5, // Drift upwards
                size: Math.random() * 10 + 6,
                alpha: Math.random() * 0.5 + 0.2,
                life: 1.0,
                decay: Math.random() * 0.012 + 0.007,
            };
        };

        const updateParticles = () => {
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.size += 0.08;
                p.life -= p.decay;
                p.alpha -= p.decay * 0.6;

                if (p.life <= 0 || p.alpha <= 0) {
                    particles.current.splice(i, 1);
                }
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.current.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();

                // Simpler secondary layer instead of expensive shadowBlur
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.25})`;
                ctx.fill();
            });
        };

        const animate = () => {
            if (mouse.current.moved && particles.current.length < MAX_PARTICLES) {
                particles.current.push(createParticle(mouse.current.x, mouse.current.y));
            } else if (Math.random() > 0.9 && particles.current.length < MAX_PARTICLES) {
                particles.current.push(createParticle(mouse.current.x, mouse.current.y));
            }

            updateParticles();
            drawParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            mouse.current.moved = true;

            // Reset moved status after a short delay to slow down emission when stopped
            clearTimeout(mouse.current.timeout);
            mouse.current.timeout = setTimeout(() => {
                mouse.current.moved = false;
            }, 50);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'screen', // Helps blend with dark background
            }}
        />
    );
};

export default SteamCursor;
