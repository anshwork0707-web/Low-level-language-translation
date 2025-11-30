import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, FileImage, Download, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

interface ExtractedText {
  text: string;
  translation: string;
  confidence: number;
  language: string;
}

export function CameraTranslate() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedText | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
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
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture photo from camera
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
        processImage(imageData);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with OCR + Translation
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('source_lang', 'nepali'); // Default, can make dynamic
      
      // Call OCR + Translate API
      const result = await api.post('/ocr/translate/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setExtractedData({
        text: result.data.extracted_text,
        translation: result.data.translation,
        confidence: result.data.confidence || 0.95,
        language: result.data.detected_language || 'nepali'
      });
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.response?.data?.detail || 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset all
  const reset = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setError(null);
    stopCamera();
  };

  // Cleanup on unmount
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
          📸 Camera Translation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Capture or upload images to extract and translate text
        </p>
      </div>

      {/* Action Buttons */}
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
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Camera View */}
      <AnimatePresence>
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
                  className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  <div className="w-14 h-14 border-4 border-blue-600 rounded-full" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stopCamera}
                  className="w-16 h-16 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white"
                >
                  <X className="w-8 h-8" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captured Image + Results */}
      <AnimatePresence>
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto max-h-[400px] object-contain bg-gray-100 dark:bg-gray-800"
              />
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={reset}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Processing Loader */}
            {isProcessing && (
              <div className="flex items-center justify-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Extracting and translating text...
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Results */}
            {extractedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Extracted Text */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-4">
                    <FileImage className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Extracted Text ({extractedData.language})
                    </h3>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {extractedData.text}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Confidence:</span>
                    <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${extractedData.confidence * 100}%` }}
                      />
                    </div>
                    <span>{(extractedData.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Translation */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Translation (English)
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigator.clipboard.writeText(extractedData.translation)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Copy translation"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {extractedData.translation}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Retake Button */}
            {extractedData && (
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <RotateCw className="w-5 h-5" />
                  Capture Another
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
