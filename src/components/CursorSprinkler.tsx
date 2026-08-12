import { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  rotation: number;
  rotSpeed: number;

  constructor(x: number, y: number, colors: string[]) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.maxLife = Math.random() * 30 + 15;
    this.life = this.maxLife;
    this.size = Math.random() * 5 + 3;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // smooth gravity
    this.vx *= 0.98; // friction
    this.life -= 1;
    this.rotation += this.rotSpeed;
    this.size *= 0.95; // shrink
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    
    ctx.beginPath();
    if (this.shape === 'circle') {
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    } else if (this.shape === 'square') {
      ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
    } else if (this.shape === 'triangle') {
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size, this.size);
      ctx.lineTo(-this.size, this.size);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }
}

export function CursorSprinkler() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Google-inspired classic colors
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FFD700', '#FF007F'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const now = performance.now();
      // Throttle particle creation slightly
      if (now - lastTime.current > 16) { 
        let clientX = 0;
        let clientY = 0;
        if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        for (let i = 0; i < 2; i++) {
          particles.current.push(new Particle(clientX, clientY, colors));
        }
        lastTime.current = now;
        
        // Restart animation loop if it was stopped
        if (!animationRef.current) {
          animate();
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onMouseMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      
      if (particles.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = undefined; // Stop loop to save CPU
      }
    };
    
    // Initial start not needed until mouse moves
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchstart', onMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
