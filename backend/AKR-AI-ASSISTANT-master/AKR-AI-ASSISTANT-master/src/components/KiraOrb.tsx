import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface KiraOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}

export const KiraOrb = ({ isListening, isSpeaking, className }: KiraOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let animationId: number;
    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      rotation += 0.01;

      // Draw outer rings
      for (let i = 3; i > 0; i--) {
        ctx.beginPath();
        const radius = 80 + i * 20;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, radius - 20,
          centerX, centerY, radius + 10
        );
        
        if (isListening) {
          gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
          gradient.addColorStop(0.5, `rgba(0, 255, 255, ${0.3 - i * 0.08})`);
          gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        } else if (isSpeaking) {
          gradient.addColorStop(0, 'rgba(138, 43, 226, 0)');
          gradient.addColorStop(0.5, `rgba(138, 43, 226, ${0.3 - i * 0.08})`);
          gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
          gradient.addColorStop(0.5, `rgba(0, 255, 255, ${0.15 - i * 0.04})`);
          gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw particles
      const particleCount = isListening || isSpeaking ? 20 : 12;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + rotation;
        const distance = 100 + Math.sin(rotation * 2 + i) * 10;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = isListening || isSpeaking ? 3 : 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        
        if (isListening) {
          ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(rotation * 3 + i) * 0.4})`;
        } else if (isSpeaking) {
          ctx.fillStyle = `rgba(138, 43, 226, ${0.6 + Math.sin(rotation * 3 + i) * 0.4})`;
        } else {
          ctx.fillStyle = `rgba(0, 255, 255, ${0.4 + Math.sin(rotation * 2 + i) * 0.3})`;
        }
        
        ctx.fill();
      }

      // Draw core
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 60
      );
      
      if (isListening) {
        coreGradient.addColorStop(0, 'rgba(0, 255, 255, 0.9)');
        coreGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
        coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
      } else if (isSpeaking) {
        coreGradient.addColorStop(0, 'rgba(138, 43, 226, 0.9)');
        coreGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.5)');
        coreGradient.addColorStop(1, 'rgba(138, 43, 226, 0.1)');
      } else {
        coreGradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
        coreGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
        coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isListening, isSpeaking]);

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full"
      />
      
      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-3xl transition-opacity duration-500",
          isListening && "bg-primary/30 opacity-100",
          isSpeaking && "bg-secondary/30 opacity-100",
          !isListening && !isSpeaking && "bg-primary/10 opacity-50"
        )}
      />
    </div>
  );
};
