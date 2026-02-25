import React, { useEffect, useRef } from 'react';

const CosmicPortal = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const particles = [];
        const particleCount = 80;
        const stars = [];
        const starCount = 150;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            stars.length = 0;
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5,
                    opacity: Math.random(),
                    blink: Math.random() * 0.01 + 0.005
                });
            }
        };

        class Particle {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.4,
                    y: (Math.random() - 0.5) * 0.4
                };
                this.color = Math.random() > 0.5 ? '#f97316' : '#ea580c';
                this.alpha = Math.random() * 0.3 + 0.1;
            }

            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;

                let dx = mouse.current.x - this.x;
                let dy = mouse.current.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    this.x -= (dx / distance) * force * 3;
                    this.y -= (dy / distance) * force * 3;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        let time = 0;
        const animate = () => {
            time += 0.005;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Shifting Nebula Gradients (Moving Fluidly)
            const g1X = canvas.width * (0.5 + Math.cos(time * 0.5) * 0.2);
            const g1Y = canvas.height * (0.5 + Math.sin(time * 0.8) * 0.2);
            const g1 = ctx.createRadialGradient(g1X, g1Y, 0, g1X, g1Y, canvas.width * 0.7);
            g1.addColorStop(0, 'rgba(249, 115, 22, 0.04)');
            g1.addColorStop(1, 'rgba(10, 11, 16, 0)');

            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const g2X = canvas.width * (0.3 + Math.sin(time * 0.4) * 0.1);
            const g2Y = canvas.height * (0.7 + Math.cos(time * 0.6) * 0.1);
            const g2 = ctx.createRadialGradient(g2X, g2Y, 0, g2X, g2Y, canvas.width * 0.6);
            g2.addColorStop(0, 'rgba(234, 88, 12, 0.03)');
            g2.addColorStop(1, 'rgba(10, 11, 16, 0)');

            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

            // Stars
            stars.forEach(s => {
                s.opacity += s.blink;
                if (s.opacity > 0.8 || s.opacity < 0.2) s.blink = -s.blink;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.4})`;
                ctx.fill();
            });

            // Physics Particles
            particles.forEach((p) => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
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
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                background: '#040508',
                pointerEvents: 'none',
            }}
        />
    );
};

export default CosmicPortal;
