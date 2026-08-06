import React, { useRef, useState, useEffect } from 'react';
import { Lock, Upload, Type, Pencil } from 'lucide-react';

type SignatureMode = 'draw' | 'type' | 'upload';

interface DigitalSignaturePadProps {
  onSignatureChange?: (signature: string | null) => void;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({ onSignatureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<SignatureMode>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && mode === 'draw') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#E67A3B';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [canvasRef.current, mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const signature = canvasRef.current.toDataURL();
      onSignatureChange?.(signature);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setTypedSignature('');
    setUploadedImage(null);
    onSignatureChange?.(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        onSignatureChange?.(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypedSignature = (text: string) => {
    setTypedSignature(text);
    if (text) {
      // Create a canvas with the typed text
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '48px Brush Script MT, cursive';
        ctx.fillStyle = '#E67A3B';
        ctx.fillText(text, 20, 60);
        onSignatureChange?.(canvas.toDataURL());
      }
    } else {
      onSignatureChange?.(null);
    }
  };

  const renderTypedSignature = () => {
    const canvas = canvasRef.current;
    if (!typedSignature || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '48px Brush Script MT, cursive';
      ctx.fillStyle = '#E67A3B';
      ctx.fillText(typedSignature, 20, 60);
      onSignatureChange?.(canvas.toDataURL());
    }
  };

  return (
    <div className="bg-card rounded-lg border-2 border-primary/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Digital Signature</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('draw')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'draw' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm">Draw</span>
        </button>
        <button
          onClick={() => setMode('type')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'type' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="text-sm">Type</span>
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload</span>
        </button>
      </div>

      {/* Signature Area */}
      <div className="relative">
        {mode === 'draw' && (
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full border-2 border-border rounded-md bg-background cursor-crosshair touch-none"
            style={{ minHeight: '200px' }}
          />
        )}

        {mode === 'type' && (
          <div className="space-y-2">
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => handleTypedSignature(e.target.value)}
              placeholder="Type your full name"
              className="w-full px-4 py-3 border-2 border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            {typedSignature && (
              <div 
                className="w-full h-[200px] border-2 border-border rounded-md bg-background flex items-center justify-center"
                style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '48px', color: '#E67A3B' }}
              >
                {typedSignature}
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              className="w-full px-4 py-3 border-2 border-border rounded-md bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploadedImage && (
              <div className="w-full h-[200px] border-2 border-border rounded-md bg-background flex items-center justify-center p-4">
                <img src={uploadedImage} alt="Signature" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={clearSignature}
          className="flex-1 px-4 py-2 border-2 border-destructive text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Clear Signature
        </button>
        <button className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
          Save Signature
        </button>
      </div>

      {/* Legal Text */}
      <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        By signing, you confirm that this digital signature is legally binding under the Information Technology Act, 2000
      </p>
    </div>
  );
};