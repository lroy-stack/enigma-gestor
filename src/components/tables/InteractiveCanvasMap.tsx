
import React, { useRef, useEffect, useState } from 'react';
import type { Mesa } from '@/types/database';
import { IOSCard, IOSCardContent } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/badge';
import { useTableCombinations, type TableCombination } from '@/hooks/useTableCombinations';

interface InteractiveCanvasMapProps {
  tables: Mesa[];
  onTableSelect: (tableId: string) => void;
  selectedTables?: string[];
  showCombinations?: boolean;
}

const TABLE_SIZE = 60;
const TABLE_COLOR = '#237584';
const SELECTED_TABLE_COLOR = '#CB5910';
const TABLE_TEXT_COLOR = '#FFFFFF';

export function InteractiveCanvasMap({ 
  tables, 
  onTableSelect, 
  selectedTables = [], 
  showCombinations = false 
}: InteractiveCanvasMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const { data: combinations = [] } = useTableCombinations();

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      setCanvasSize({
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw tables
    tables.forEach(table => {
      const isSelected = selectedTables.includes(table.id);
      ctx.fillStyle = isSelected ? SELECTED_TABLE_COLOR : TABLE_COLOR;
      ctx.beginPath();
      ctx.arc(table.position_x, table.position_y, TABLE_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = TABLE_TEXT_COLOR;
      ctx.font = 'bold 16px -apple-system, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(table.numero_mesa, table.position_x, table.position_y + 5);
    });

    drawCombinations(ctx);
  }, [tables, selectedTables, canvasSize, showCombinations, combinations]);

  const activeCombinations = combinations.filter(combo => combo.activa);

  const drawCombinations = (ctx: CanvasRenderingContext2D) => {
    if (!showCombinations) return;

    activeCombinations.forEach(combination => {
      if (!combination.mesas_secundarias || combination.mesas_secundarias.length === 0) return;

      const allTableIds = [combination.mesa_principal_id, ...combination.mesas_secundarias];
      const combinationTables = tables.filter(table => allTableIds.includes(table.id));

      if (combinationTables.length < 2) return;

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      combinationTables.forEach((table, index) => {
        if (index === 0) {
          ctx.moveTo(table.position_x, table.position_y);
        } else {
          ctx.lineTo(table.position_x, table.position_y);
        }
      });
      ctx.closePath();
      ctx.stroke();

      // Draw combination label
      const labelCenterX = combinationTables.reduce((sum, table) => sum + table.position_x, 0) / combinationTables.length;
      const labelCenterY = combinationTables.reduce((sum, table) => sum + table.position_y, 0) / combinationTables.length;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px -apple-system, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(combination.nombre_combinacion || 'Combinación', labelCenterX, labelCenterY - 30);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    tables.forEach(table => {
      const distance = Math.sqrt(
        Math.pow(x - table.position_x, 2) + Math.pow(y - table.position_y, 2)
      );

      if (distance <= TABLE_SIZE / 2) {
        onTableSelect(table.id);
      }
    });
  };

  return (
    <IOSCard variant="elevated" className="shadow-ios-lg">
      <IOSCardContent className="p-4">
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%', cursor: 'pointer' }}
          />
        </div>
      </IOSCardContent>
    </IOSCard>
  );
}
