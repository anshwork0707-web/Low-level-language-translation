import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, Eye, EyeOff, RotateCw, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

type Mode = 'camera' | 'live';

interface ExtractedText {
  text: string;
  translation: string;
  confidence: number;
  language: string;
}

interface TextRegion {
  bbox: number[][];
  original_text: string;
  translated_text: string;
  confidence: number;
}

interface LiveTranslationResult {
  original_image_url: string;
  translated_image_url: string;
  text_regions: TextRegion[];
  total_regions: number;
  avg_confidence: number;
}

export function ImageTranslate() {
  const [mode, setMode] = useState<Mode>('camera');
  const [sourceLang, setSourceLang] = useState('nepali');

  // Camera mode states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedText | null>(null);

  // Live mode states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<LiveTranslationResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // Shared states
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ===== CAMERA MODE FUNCTIONS =====

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.');
      toast.error('Camera access denied');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
        processCameraImage(imageData);
      }
    }
  };

  const handleCameraFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        processCameraImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processCameraImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('source_lang', sourceLang);
      
      const result = await api.post('/ocr/translate/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setExtractedData({
        text: result.data.extracted_text,
        translation: result.data.translation,
        confidence: result.data.confidence || 0.95,
        language: result.data.detected_language || sourceLang
      });
      toast.success('Text extracted and translated!');
    } catch (err: any) {
      console.error('Processing error:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to process image';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setError(null);
    stopCamera();
  };

  // ===== LIVE MODE FUNCTIONS =====

  const handleLiveFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setLiveResult(null);
  };

  const processLiveImage = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setLiveResult(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('source_lang', sourceLang);
      formData.append('target_lang', 'english');
      formData.append('return_image', 'true');

      const response = await api.post('/ocr/live-translate/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLiveResult(response.data);
      toast.success(`Translated ${response.data.total_regions} text regions!`);
      
      setTimeout(() => drawOverlays(), 100);
    } catch (err: any) {
      console.error('Processing error:', err);
      toast.error(err.response?.data?.detail || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const drawOverlays = () => {
    if (!liveResult || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    if (!showOverlay) return;

    liveResult.text_regions.forEach((region, index) => {
      const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = region.bbox;

      const minX = Math.min(x1, x2, x3, x4);
      const minY = Math.min(y1, y2, y3, y4);
      const maxX = Math.max(x1, x2, x3, x4);
      const maxY = Math.max(y1, y2, y3, y4);
      const width = maxX - minX;
      const height = maxY - minY;

      const isSelected = selectedRegion === index;

      ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(minX, minY, width, height);

      ctx.strokeStyle = isSelected ? '#3b82f6' : '#10b981';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(minX, minY, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(16, height * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = region.translated_text;
      const centerX = minX + width / 2;
      const centerY = minY + height / 2;
      
      const maxWidth = width * 0.9;
      const words = text.split(' ');
      let line = '';
      let y = centerY;
      const lineHeight = height * 0.7;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), centerX, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), centerX, y);

      if (isSelected) {
        const confidence = Math.round(region.confidence * 100);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.fillRect(minX, minY - 25, 80, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${confidence}%`, minX + 5, minY - 12);
      }
    });
  };

  const resetLive = () => {
    setImageFile(null);
    setImagePreview(null);
    setLiveResult(null);
    setSelectedRegion(null);
  };

  useEffect(() => {
    if (liveResult) {
      drawOverlays();
    }
  }, [liveResult, showOverlay, selectedRegion]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📷 Image Translate
        </h2>
        <p className="text-muted-foreground mt-2">
          Capture photos or upload images to extract and translate text
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 p-1 bg-secondary/50 rounded-lg max-w-md mx-auto">
        <button
          onClick={() => {
            setMode('camera');
            resetLive();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
            mode === 'camera'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-4 h-4" />
          Image Translate
        </button>
        <button
          onClick={() => {
            setMode('live');
            resetCamera();
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
            mode === 'live'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Live Translate
        </button>
      </div>

      {/* Language Selector */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 p-1 bg-secondary/50 rounded-lg">
          <span className="text-sm text-muted-foreground px-2">Source:</span>
          <button
            onClick={() => setSourceLang('nepali')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              sourceLang === 'nepali'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Nepali
          </button>
          <button
            onClick={() => setSourceLang('sinhala')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              sourceLang === 'sinhala'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sinhala
          </button>
        </div>
      </div>

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="space-y-4">
          {!capturedImage && !isCameraOpen && (
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload Image
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCameraFileUpload}
                className="hidden"
              />
            </div>
          )}

          {isCameraOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-[500px] object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopCamera}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src={capturedImage} alt="Captured" className="w-full h-auto" />
              </div>

              {isProcessing && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Processing image...</p>
                </div>
              )}

              {extractedData && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      📄 Extracted Text
                      <span className="text-xs text-muted-foreground">({extractedData.language})</span>
                    </h3>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{extractedData.text}</p>
                  </div>

                  <div className="card p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      🌐 Translation
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {Math.round(extractedData.confidence * 100)}% confident
                      </span>
                    </h3>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{extractedData.translation}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetCamera}
                  className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  Try Another
                </motion.button>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Live Mode */}
      {mode === 'live' && (
        <div className="space-y-4">
          {!imagePreview && (
            <div className="card p-8 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md mx-auto py-12 border-2 border-dashed border-border hover:border-primary/50 rounded-xl transition-all"
              >
                <Upload className="w-16 h-16 mx-auto text-primary mb-4" />
                <p className="text-lg font-semibold mb-2">Upload an Image</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, or JPEG (max 10MB)
                </p>
              </motion.button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLiveFileUpload}
                className="hidden"
              />
            </div>
          )}

          {imagePreview && !liveResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[500px] object-contain" />
              </div>

              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={processLiveImage}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Translate Image
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetLive}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}

          {liveResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      showOverlay
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {showOverlay ? 'Hide' : 'Show'} Overlay
                  </motion.button>

                  <span className="text-sm text-muted-foreground">
                    {liveResult.total_regions} regions • {Math.round(liveResult.avg_confidence * 100)}% avg confidence
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetLive}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  New Image
                </motion.button>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <img
                  ref={imageRef}
                  src={imagePreview || ''}
                  alt="Result"
                  className="w-full h-auto hidden"
                  onLoad={drawOverlays}
                />
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto cursor-pointer"
                />
              </div>

              {liveResult.text_regions.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">📝 Text Regions</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {liveResult.text_regions.map((region, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedRegion(selectedRegion === index ? null : index)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedRegion === index
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-secondary/50 border border-transparent hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground mb-1">{region.original_text}</p>
                            <p className="text-sm font-medium text-foreground">→ {region.translated_text}</p>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">
                            {Math.round(region.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Hidden canvas for camera mode */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
