import React, { useEffect, useRef, useState } from 'react';
import { Button, Space } from 'antd';

export default function SignaturePad({ value, onChange, disabled = false }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(Boolean(value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#1f2937';
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = value;
      setHasStroke(true);
    } else {
      setHasStroke(false);
    }
  }, [value]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event) => {
    if (disabled) return;
    event.preventDefault();
    const context = canvasRef.current.getContext('2d');
    const point = getPoint(event);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (disabled || !drawingRef.current) return;
    event.preventDefault();
    const context = canvasRef.current.getContext('2d');
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasStroke(true);
  };

  const finishDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onChange?.(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onChange?.('');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={760}
        height={220}
        className="w-full rounded border border-dashed border-gray-300 bg-white"
        style={{ height: 220, touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={finishDrawing}
      />
      {!disabled && (
        <Space className="mt-2">
          <Button onClick={clear}>清除</Button>
          <span className="text-sm text-gray-500">{hasStroke ? '签名已记录' : '请在签名区域手写签名'}</span>
        </Space>
      )}
    </div>
  );
}
