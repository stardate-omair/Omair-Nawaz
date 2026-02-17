document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Cursor Tracker Functionality
    const odometerDisplay = document.getElementById('pixel-odometer');
    let totalDistance = 0;
    let lastX = null;
    let lastY = null;

    // Load saved distance if any
    const savedDistance = localStorage.getItem('cursorDistance');
    if (savedDistance) {
        totalDistance = parseFloat(savedDistance);
        odometerDisplay.textContent = Math.floor(totalDistance).toLocaleString();
    }

    document.addEventListener('mousemove', (e) => {
        if (lastX !== null && lastY !== null) {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const distance = Math.hypot(dx, dy);

            totalDistance += distance;

            // Update display every few pixels to avoid too many reflows if wanted, 
            // but immediate update looks cooler
            odometerDisplay.textContent = Math.floor(totalDistance).toLocaleString();
        }

        lastX = e.clientX;
        lastY = e.clientY;
    });

    // Save periodically/on unload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('cursorDistance', totalDistance);
    });

    // Background Animation
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Resize handling
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        window.addEventListener('resize', resize);

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 255, 157, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = Math.floor(width * height / 15000); // Responsive count
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p, index) => {
                p.update();
                p.draw();

                // Draw connections
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(0, 255, 157, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        }

        resize();
        animate();
    }
});
