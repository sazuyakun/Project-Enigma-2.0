import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Network, Share2 } from 'lucide-react';

interface Node {
  id: string;
  risk: number;
  connections: number;
}

const NetworkGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock data for the network
  const nodes: Node[] = [
    { id: "A", risk: 85, connections: 5 },
    { id: "B", risk: 92, connections: 3 },
    { id: "C", risk: 78, connections: 4 },
    { id: "D", risk: 95, connections: 6 },
    { id: "E", risk: 88, connections: 2 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Initial canvas setup and resize listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Calculate node positions
    const positions = nodes.map((_, i) => ({
      x: canvas.width / 2 + Math.cos(2 * Math.PI * i / nodes.length) * 100,
      y: canvas.height / 2 + Math.sin(2 * Math.PI * i / nodes.length) * 100
    }));

    // Animation frame
    let animationId: number;
    let frame = 0;
    const animate = () => {
      frame++;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.beginPath();
      positions.forEach((pos1, i) => {
        positions.forEach((pos2, j) => {
          if (i < j) {
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
          }
        });
      });
      ctx.strokeStyle = '#1f2937';
      ctx.stroke();

      // Draw nodes
      positions.forEach((pos, i) => {
        const node = nodes[i];

        // Pulse effect
        const pulse = Math.sin(frame * 0.05 + i) * 2;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${node.risk / 200})`;
        ctx.fill();

        // Node border
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id, pos.x, pos.y);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center mb-4 text-emerald-400">
        <Share2 className="w-5 h-5 mr-2" />
        <span className="font-medium">Network Analysis</span>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gray-900/50 rounded-lg overflow-hidden"
        style={{ height: '300px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>
    </div>
  );
};

export default NetworkGraph;
