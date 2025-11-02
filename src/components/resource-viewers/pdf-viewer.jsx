"use client";

import { useState } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2, ExternalLink } from 'lucide-react';

export function PdfViewer({ fileUrl, title }) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function handleZoomIn() {
    setZoom((prev) => Math.min(200, prev + 25));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(50, prev - 25));
  }

  function handleFullscreen() {
    if (!isFullscreen) {
      const elem = document.querySelector('.pdf-viewer-container');
      if (elem?.requestFullscreen) {
        elem.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }

  return (
    <div className="w-full pdf-viewer-container">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Zoom: {zoom}%</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={fileUrl}
            download
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
        <div className="overflow-auto max-h-[700px] flex items-center justify-center p-4">
          <iframe
            src={`${fileUrl}#zoom=${zoom}`}
            className="w-full"
            style={{
              height: `${(zoom / 100) * 700}px`,
              minHeight: '500px',
            }}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

