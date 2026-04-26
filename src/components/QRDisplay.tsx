import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

interface QRDisplayProps {
  toolId: string;
  toolName: string;
  partNumber: string;
  size?: number;
}

export function QRDisplay({ toolId, toolName, partNumber, size = 140 }: QRDisplayProps) {
  const value = JSON.stringify({ toolId, partNumber });

  function handleDownload() {
    const svg = document.getElementById(`qr-${toolId}`)?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${partNumber}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        id={`qr-${toolId}`}
        className="rounded-lg border border-surface-700/60 bg-white p-3 shadow-inner"
      >
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#0a0a14"
          level="M"
          includeMargin={false}
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-surface-300">{toolName}</p>
        <p className="font-mono text-[10px] text-surface-500">{partNumber}</p>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 rounded border border-surface-700/60 px-3 py-1.5 text-xs text-surface-400 transition-colors hover:border-surface-500 hover:text-surface-200"
      >
        <Download size={12} />
        Download QR
      </button>
    </div>
  );
}
