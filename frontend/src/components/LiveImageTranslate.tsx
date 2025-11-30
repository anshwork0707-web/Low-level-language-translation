import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Loader2, Download, Eye, EyeOff, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

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

export function LiveImageTranslate() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<LiveTranslationResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [sourceLang, setSourceLang] = useState('nepali');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setResult(null);
  };

  // Process image with live translation
  const processImage = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setResult(null);

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

      setResult(response.data);
      toast.success(`Translated ${response.data.total_regions} text regions!`);
      
      // Draw overlays after result is set
      setTimeout(() => drawOverlays(), 100);
    } catch (err: any) {
      console.error('Processing error:', err);
      toast.error(err.response?.data?.detail || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Draw translation overlays on canvas
  const drawOverlays = () => {
    if (!result || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    if (!showOverlay) return;

    // Draw each text region
    result.text_regions.forEach((region, index) => {
      const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = region.bbox;

      // Calculate bounding box
      const minX = Math.min(x1, x2, x3, x4);
      const minY = Math.min(y1, y2, y3, y4);
      const maxX = Math.max(x1, x2, x3, x4);
      const maxY = Math.max(y1, y2, y3, y4);
      const width = maxX - minX;
      const height = maxY - minY;

      // Highlight if selected
      const isSelected = selectedRegion === index;

      // Draw semi-transparent background
      ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(minX, minY, width, height);

      // Draw border
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#10b981';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(minX, minY, width, height);

      // Draw translated text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(16, height * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = region.translated_text;
      const centerX = minX + width / 2;
      const centerY = minY + height / 2;
      
      // Word wrap if text is too long
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

      // Draw confidence badge
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

  // Redraw overlays when settings change
  useEffect(() => {
    if (result) {
      drawOverlays();
    }
  }, [result, showOverlay, selectedRegion]);

  // Handle canvas click to select regions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find clicked region
    let clickedIndex = null;
    result.text_regions.forEach((region, index) => {
      const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = region.bbox;
      const minX = Math.min(x1, x2, x3, x4);
      const minY = Math.min(y1, y2, y3, y4);
      const maxX = Math.max(x1, x2, x3, x4);
      const maxY = Math.max(y1, y2, y3, y4);

      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        clickedIndex = index;
      }
    });

    setSelectedRegion(clickedIndex);
  };

  // Download translated image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'translated-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success('Image downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🔍 Live Image Translation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload an image and see translations overlaid directly on text regions
        </p>
      </div>

      {/* Language Selector */}
      {!result && (
        <div className="flex justify-center gap-4">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="nepali">Nepali</option>
            <option value="sinhala">Sinhala</option>
            <option value="hindi">Hindi</option>
            <option value="tamil">Tamil</option>
          </select>
        </div>
      )}

      {/* Upload Area */}
      {!imagePreview && (
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Image Preview & Processing */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Control Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {!result && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={processImage}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
              )}

              {result && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowOverlay(!showOverlay)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {showOverlay ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    {showOverlay ? 'Hide' : 'Show'} Overlay
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadImage}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setResult(null);
                      setSelectedRegion(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Image
                  </motion.button>
                </>
              )}

              {imagePreview && !isProcessing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setResult(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </motion.button>
              )}
            </div>

            {/* Image Display */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
              {result ? (
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={imagePreview}
                    alt="Original"
                    className="hidden"
                    onLoad={drawOverlays}
                  />
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full h-auto cursor-pointer"
                  />
                  
                  {/* Info Overlay */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium">
                      {result.total_regions} text regions • {Math.round(result.avg_confidence * 100)}% avg confidence
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Click on text to highlight • Toggle overlay to compare
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              )}
            </div>

            {/* Selected Region Details */}
            {result && selectedRegion !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Selected Region #{selectedRegion + 1}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Original ({sourceLang}):
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {result.text_regions[selectedRegion].original_text}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                      Translation (English):
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {result.text_regions[selectedRegion].translated_text}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400">Confidence:</span>
                  <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${result.text_regions[selectedRegion].confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {Math.round(result.text_regions[selectedRegion].confidence * 100)}%
                  </span>
                </div>
              </motion.div>
            )}

            {/* All Regions List */}
            {result && result.text_regions.length > 0 && (
              <div className="p-6 bg-secondary/30 rounded-xl border border-border">
                <h3 className="font-semibold mb-4">All Detected Text Regions ({result.total_regions})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.text_regions.map((region, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedRegion(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedRegion === index
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {region.original_text}
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                            → {region.translated_text}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
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
      </AnimatePresence>
    </div>
  );
}
