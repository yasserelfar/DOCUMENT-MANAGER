import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  url: string;
  type: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, type }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [highlights, setHighlights] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }[]>([]);
  const [matchCount, setMatchCount] = useState(0);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // DOM-based highlight after each render
  useEffect(() => {
    if (!keyword.trim()) {
      setHighlights([]);
      setMatchCount(0);
      return;
    }
    // Wait for text layer to be rendered
    const timeout = setTimeout(() => {
      const textLayer = document.querySelector('.react-pdf__Page__textContent');
      if (!textLayer) return;
      const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT);
      const boxes: { top: number; left: number; width: number; height: number }[] = [];
      let totalMatches = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const text = node.textContent || '';
        let idx = 0;
        while (true) {
          const matchIdx = text.toLowerCase().indexOf(keyword.toLowerCase(), idx);
          if (matchIdx === -1) break;
          // Use Range API to get bounding box
          const range = document.createRange();
          range.setStart(node, matchIdx);
          range.setEnd(node, matchIdx + keyword.length);
          const rects = range.getClientRects();
          for (const rect of rects) {
            // Convert to relative position inside the textLayer
            const layerRect = (textLayer as HTMLElement).getBoundingClientRect();
            boxes.push({
              top: rect.top - layerRect.top,
              left: rect.left - layerRect.left,
              width: rect.width,
              height: rect.height
            });
          }
          totalMatches++;
          idx = matchIdx + keyword.length;
        }
      }
      setHighlights(boxes);
      setMatchCount(totalMatches);
    }, 100); // Wait for text layer to render
    return () => clearTimeout(timeout);
  }, [keyword, pageNumber, scale]);

  if (type.includes('pdf')) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Enter keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && setKeyword(e.currentTarget.value)}
            className="px-2 py-1 border rounded"
          />
          <button
            onClick={() => setKeyword(keyword)}
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
          {matchCount > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              Found {matchCount} matches
            </span>
          )}
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="relative border rounded-lg shadow-lg overflow-auto max-h-[80vh]">
          <PDFDocument file={url} onLoadSuccess={handleDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </PDFDocument>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: h.top,
                  left: h.left,
                  width: h.width,
                  height: h.height,
                  backgroundColor: 'yellow',
                  opacity: 0.5,
                  pointerEvents: 'none',
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <p>Preview not available for this file type</p>
    </div>
  );
};