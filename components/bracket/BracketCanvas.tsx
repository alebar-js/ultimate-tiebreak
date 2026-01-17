'use client';

import { ReactNode, useRef, useCallback, useState } from 'react';
import { TransformWrapper, TransformComponent, useControls, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { QRCodeSVG } from 'qrcode.react';
import { encodeTournamentId } from '@/lib/hash';

interface BracketCanvasProps {
  children: ReactNode;
  tournamentId?: string;
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

export default function BracketCanvas({ children, tournamentId }: BracketCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showQRExpanded, setShowQRExpanded] = useState(false);

  // Generate the player page URL
  const playerPageUrl = tournamentId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/players/${encodeTournamentId(tournamentId)}`
    : null;

  // Pan to show the right side (later rounds) on init
  const handleInit = useCallback((ref: ReactZoomPanPinchRef) => {
    // Small delay to ensure content is rendered and measured
    requestAnimationFrame(() => {
      const wrapper = ref.instance.wrapperComponent;
      const content = contentRef.current;

      if (!wrapper || !content) return;

      const wrapperWidth = wrapper.clientWidth;
      const contentWidth = content.scrollWidth;

      // If content is wider than viewport, pan to show the right side
      if (contentWidth > wrapperWidth) {
        const panX = -(contentWidth - wrapperWidth);
        ref.setTransform(panX, 0, 1, 0);
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-primary overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.25}
        maxScale={2}
        onInit={handleInit}
        limitToBounds={false}
        centerZoomedOut={false}
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
            minHeight: '100%',
          }}
        >
          <div ref={contentRef}>
            {children}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Bottom Left: QR Code + Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        {playerPageUrl && (
          <div className="mb-2">
            {showQRExpanded ? (
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs text-gray-600 font-medium">Scan to find your match</p>
                  <button
                    onClick={() => setShowQRExpanded(false)}
                    className="text-gray-400 hover:text-gray-600 -mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <QRCodeSVG value={playerPageUrl} size={180} />
              </div>
            ) : (
              <button
                onClick={() => setShowQRExpanded(true)}
                className="bg-white p-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
                title="Show QR code for players"
              >
                <QRCodeSVG value={playerPageUrl} size={72} />
              </button>
            )}
          </div>
        )}
        <div className="text-xs text-white/70 bg-black/20 px-2 py-1 rounded">
          Scroll to zoom | Drag to pan
        </div>
      </div>
    </div>
  );
}
