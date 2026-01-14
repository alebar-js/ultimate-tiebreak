'use client';

import { ReactNode, useRef } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';

interface BracketCanvasProps {
  children: ReactNode;
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
      <button
        onClick={() => zoomOut()}
        className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center hover:bg-black/30 transition-colors text-lg font-bold text-white"
        title="Zoom out"
      >
        -
      </button>
      <button
        onClick={() => resetTransform()}
        className="h-10 px-3 bg-black/20 rounded-lg flex items-center justify-center hover:bg-black/30 transition-colors text-sm font-medium text-white"
        title="Reset zoom"
      >
        Reset
      </button>
      <button
        onClick={() => zoomIn()}
        className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center hover:bg-black/30 transition-colors text-lg font-bold text-white"
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
}

export default function BracketCanvas({ children }: BracketCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-primary overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        panning={{
          velocityDisabled: true,
          excluded: ['match-node'],
        }}
      >
        <ZoomControls />
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
          }}
        >
          {children}
        </TransformComponent>
      </TransformWrapper>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-white/70 bg-black/20 px-2 py-1 rounded">
        Scroll to zoom | Drag to pan
      </div>
    </div>
  );
}
