import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { X, Check } from 'lucide-react';
import Button from './Button';

// Utility para extraer la imagen recortada del canvas
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // No agregamos fondo blanco para preservar la transparencia original (útil en logos)
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png'); // Exportar como PNG para preservar el fondo transparente
  });
};

const ImageCropperModal = ({ isOpen, onClose, imageSrc, onCropComplete, title = "Ajustar Imagen" }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Optimizar/comprimir usando browser-image-compression
      const options = {
        maxSizeMB: 2, // Aumentado a 2MB para preservar máxima calidad en PNG
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/png', // Forzar compresión a PNG para mantener canal alpha
      };
      
      const compressedFile = await imageCompression(croppedBlob, options);
      // Convertir Blob a File
      const finalFile = new File([compressedFile], 'cropped_image.png', { type: 'image/png' });
      
      await onCropComplete(finalFile);
    } catch (err) {
      console.error('Error al recortar/comprimir la imagen:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls & Footer */}
        <div className="p-4 bg-white border-t border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
              Ajustar Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-nablus-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} icon={Check} loading={loading}>
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
