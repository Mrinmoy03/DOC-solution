import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { removeBackground } from "@imgly/background-removal";
import gsap from 'gsap';

import { Header } from './photo-viewer/Header';
import { Sidebar } from './photo-viewer/Sidebar';
import { Canvas } from './photo-viewer/Canvas';
import { SaveModal } from './photo-viewer/SaveModal';
import { PRESET_CATEGORIES } from './photo-viewer/constants';
import type { PhotoViewerProps, BackgroundState, ResizeDimensions } from './photo-viewer/types';

export const PhotoViewer = ({ file, onClose }: PhotoViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);

  // Border
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#000000');

  const imgRef = useRef<HTMLImageElement>(null);

  // Canvas / Fit Mode
  const [canvasMode, setCanvasMode] = useState<'original' | 'square'>('original');
  const [background, setBackground] = useState<BackgroundState>({ type: 'color', value: '#ffffff' });

  // Resize
  const [resizeDimensions, setResizeDimensions] = useState<ResizeDimensions>({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [resizeUnit, setResizeUnit] = useState<'px' | 'in' | 'cm'>('px');
  const [dpi, setDpi] = useState(96);

  // Background Removal
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Save Modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filename, setFilename] = useState('pdf-hub-edited');
  const [saveFormat, setSaveFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleReset = useCallback(() => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setGrayscale(0);
    setSepia(0);
    setBlur(0);
    setHueRotate(0);
    setRotate(0);
    setScale(1);
    setBorderWidth(0);
    setBorderColor('#000000');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCanvasMode('original');
    setBackground({ type: 'color', value: '#ffffff' });
    if (imgRef.current) {
      setResizeDimensions({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
    }
  }, []);

  const handlePresetClick = (preset: typeof PRESET_CATEGORIES[0]['presets'][0]) => {
    setBrightness(preset.filter.brightness);
    setContrast(preset.filter.contrast);
    setSaturate(preset.filter.saturate);
    setGrayscale(preset.filter.grayscale);
    setSepia(preset.filter.sepia);
    setHueRotate(preset.filter.hueRotate);
    setBlur(preset.filter.blur);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    gsap.fromTo(e.currentTarget, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 });
    setResizeDimensions({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight });
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const croppedImageUrl = canvas.toDataURL('image/png');
    setImageUrl(croppedImageUrl);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const calculateOutputDimensions = useCallback(() => {
    if (!imgRef.current) return { width: 0, height: 0 };
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const targetCrop = (canvasMode !== 'square' && completedCrop) ? completedCrop : {
      unit: 'px',
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    } as PixelCrop;

    const srcW = targetCrop.width * scaleX;
    const srcH = targetCrop.height * scaleY;

    let outputWidth, outputHeight;
    const rads = (rotate * Math.PI) / 180;

    if (canvasMode === 'square') {
      const maxDim = Math.max(image.naturalWidth, image.naturalHeight);
      outputWidth = maxDim;
      outputHeight = maxDim;
    } else {
      outputWidth = Math.abs(Math.cos(rads) * srcW) + Math.abs(Math.sin(rads) * srcH);
      outputHeight = Math.abs(Math.sin(rads) * srcW) + Math.abs(Math.cos(rads) * srcH);
    }

    return { width: Math.round(outputWidth), height: Math.round(outputHeight) };
  }, [canvasMode, completedCrop, rotate]);

  useEffect(() => {
    const dims = calculateOutputDimensions();
    if (dims.width > 0 && dims.height > 0) {
      setResizeDimensions(dims);
    }
  }, [calculateOutputDimensions]);

  const handleResizeChange = (dimension: 'width' | 'height', value: number) => {
    const aspect = resizeDimensions.width / resizeDimensions.height;
    if (maintainAspectRatio && resizeDimensions.width > 0 && resizeDimensions.height > 0) {
      if (dimension === 'width') {
        setResizeDimensions({ width: value, height: Math.round(value / aspect) });
      } else {
        setResizeDimensions({ width: Math.round(value * aspect), height: value });
      }
    } else {
      setResizeDimensions(prev => ({ ...prev, [dimension]: value }));
    }
  };

  const handleRemoveBackground = async () => {
    if (!imageUrl) return;
    setIsRemovingBg(true);
    try {
      const blob = await removeBackground(imageUrl);
      const newUrl = URL.createObjectURL(blob);
      setImageUrl(newUrl);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("Failed to remove background. See console for details.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const getFilterString = () => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hueRotate}deg)`;
  };

  const handleApplyResize = async () => {
    if (!imgRef.current) return;
    const image = imgRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = resizeDimensions.width;
    canvas.height = resizeDimensions.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const targetCrop = (canvasMode !== 'square' && completedCrop) ? completedCrop : {
      unit: 'px',
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    } as PixelCrop;

    const srcX = targetCrop.x * scaleX;
    const srcY = targetCrop.y * scaleY;
    const srcW = targetCrop.width * scaleX;
    const srcH = targetCrop.height * scaleY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const idealDims = calculateOutputDimensions();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = idealDims.width;
    tempCanvas.height = idealDims.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.save();
    tempCtx.translate(idealDims.width / 2, idealDims.height / 2);
    const rads = (rotate * Math.PI) / 180;
    tempCtx.rotate(rads);
    tempCtx.filter = getFilterString();

    let drawW = srcW;
    let drawH = srcH;

    if (canvasMode === 'square') {
      const bbW = Math.abs(Math.cos(rads) * srcW) + Math.abs(Math.sin(rads) * srcH);
      const bbH = Math.abs(Math.sin(rads) * srcW) + Math.abs(Math.cos(rads) * srcH);
      const fitScale = Math.min((idealDims.width * 0.9) / bbW, (idealDims.height * 0.9) / bbH);
      drawW = srcW * fitScale;
      drawH = srcH * fitScale;
    }

    tempCtx.drawImage(image, srcX, srcY, srcW, srcH, -drawW / 2, -drawH / 2, drawW, drawH);

    if (canvasMode === 'square') {
      tempCtx.globalCompositeOperation = 'destination-over';
      if (background.type === 'color') {
        tempCtx.fillStyle = background.value;
        tempCtx.fillRect(-idealDims.width / 2, -idealDims.height / 2, idealDims.width, idealDims.height);
      }
    }
    tempCtx.restore();

    ctx.drawImage(tempCanvas, 0, 0, idealDims.width, idealDims.height, 0, 0, resizeDimensions.width, resizeDimensions.height);

    const newUrl = canvas.toDataURL('image/png');
    setImageUrl(newUrl);

    setRotate(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCanvasMode('original');
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setGrayscale(0);
    setSepia(0);
    setHueRotate(0);
    setBlur(0);
  };

  const handleDpiChange = (newDpi: number) => {
    if (resizeUnit !== 'px' && newDpi > 0) {
      const ratio = newDpi / dpi;
      setResizeDimensions({
        width: Math.round(resizeDimensions.width * ratio),
        height: Math.round(resizeDimensions.height * ratio)
      });
    }
    setDpi(newDpi);
  };

  const getDisplayValue = (px: number) => {
    if (resizeUnit === 'px') return px;
    if (resizeUnit === 'in') return Number((px / dpi).toFixed(2));
    if (resizeUnit === 'cm') return Number((px / dpi * 2.54).toFixed(2));
    return px;
  };

  const handleDisplayValueChange = (dimension: 'width' | 'height', value: number) => {
    let pxValue = value;
    if (resizeUnit === 'in') pxValue = Math.round(value * dpi);
    if (resizeUnit === 'cm') pxValue = Math.round(value / 2.54 * dpi);

    handleResizeChange(dimension, pxValue);
  };

  const handleDownload = async () => {
    if (!imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const targetCrop = (canvasMode !== 'square' && completedCrop) ? completedCrop : {
      unit: 'px',
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    } as PixelCrop;

    const srcX = targetCrop.x * scaleX;
    const srcY = targetCrop.y * scaleY;
    const srcW = targetCrop.width * scaleX;
    const srcH = targetCrop.height * scaleY;

    let outputWidth, outputHeight;
    const rads = (rotate * Math.PI) / 180;

    if (canvasMode === 'square') {
      const maxDim = Math.max(image.naturalWidth, image.naturalHeight);
      outputWidth = maxDim;
      outputHeight = maxDim;
    } else {
      outputWidth = Math.abs(Math.cos(rads) * srcW) + Math.abs(Math.sin(rads) * srcH);
      outputHeight = Math.abs(Math.sin(rads) * srcW) + Math.abs(Math.cos(rads) * srcH);
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    if (background.type === 'color') {
      ctx.fillStyle = background.value;
      ctx.fillRect(0, 0, outputWidth, outputHeight);
    }

    if (canvasMode === 'square') {
      if (background.type === 'blur') {
        const scaleCover = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
        const bgW = image.naturalWidth * scaleCover;
        const bgH = image.naturalHeight * scaleCover;
        const bgX = (outputWidth - bgW) / 2;
        const bgY = (outputHeight - bgH) / 2;

        ctx.save();
        ctx.filter = `blur(40px) brightness(0.7)`;
        ctx.drawImage(image, bgX, bgY, bgW, bgH);
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate(rads);
    ctx.filter = getFilterString();

    let drawW = srcW;
    let drawH = srcH;

    if (canvasMode === 'square') {
      const bbW = Math.abs(Math.cos(rads) * srcW) + Math.abs(Math.sin(rads) * srcH);
      const bbH = Math.abs(Math.sin(rads) * srcW) + Math.abs(Math.cos(rads) * srcH);

      const fitScale = Math.min(
        (outputWidth * 0.9) / bbW,
        (outputHeight * 0.9) / bbH
      );

      drawW = srcW * fitScale;
      drawH = srcH * fitScale;
    }

    ctx.drawImage(
      image,
      srcX, srcY, srcW, srcH,
      -drawW / 2, -drawH / 2, drawW, drawH
    );

    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      const borderScale = drawW / srcW;
      ctx.lineWidth = borderWidth / scaleX * borderScale * 2;
      ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);
    }

    ctx.restore();

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = resizeDimensions.width;
    finalCanvas.height = resizeDimensions.height;
    const finalCtx = finalCanvas.getContext('2d');

    if (finalCtx) {
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(canvas, 0, 0, resizeDimensions.width, resizeDimensions.height);

      const mimeType = saveFormat === 'jpeg' ? 'image/jpeg' : `image/${saveFormat}`;

      finalCanvas.toBlob(async (blob) => {
        if (!blob) return;

        let finalBlob = blob;
        if (dpi !== 72) {
          if (saveFormat === 'png') {
            const { addDpiToPng } = await import('../utils/imageMetadata');
            finalBlob = await addDpiToPng(blob, dpi);
          } else if (saveFormat === 'jpeg') {
            const { addDpiToJpeg } = await import('../utils/imageMetadata');
            finalBlob = await addDpiToJpeg(blob, dpi);
          }
        }

        const link = document.createElement('a');
        link.download = `${filename}.${saveFormat}`;
        link.href = URL.createObjectURL(finalBlob);
        link.click();

        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        setShowSaveModal(false);

      }, mimeType, 0.9);
    }
  };

  if (!file || !imageUrl) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 bg-slate-950 flex flex-col animate-in fade-in duration-300 overflow-hidden h-[100dvh] w-[100dvw]">
      <Header
        file={file}
        onClose={onClose}
        onSaveClick={() => setShowSaveModal(true)}
      />

      <SaveModal
        show={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        filename={filename}
        setFilename={setFilename}
        saveFormat={saveFormat}
        setSaveFormat={setSaveFormat}
        onDownload={handleDownload}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          brightness={brightness} setBrightness={setBrightness}
          contrast={contrast} setContrast={setContrast}
          saturate={saturate} setSaturate={setSaturate}
          hueRotate={hueRotate} setHueRotate={setHueRotate}
          scale={scale} setScale={setScale}
          rotate={rotate} setRotate={setRotate}
          resizeUnit={resizeUnit} onResizeUnitChange={setResizeUnit}
          dpi={dpi} onDpiChange={handleDpiChange}
          resizeDimensions={resizeDimensions} onDisplayValueChange={handleDisplayValueChange}
          maintainAspectRatio={maintainAspectRatio} setMaintainAspectRatio={setMaintainAspectRatio}
          onApplyResize={handleApplyResize}
          getDisplayValue={getDisplayValue}
          grayscale={grayscale} setGrayscale={setGrayscale}
          sepia={sepia} setSepia={setSepia}
          blur={blur} setBlur={setBlur}
          onPresetClick={handlePresetClick}
          onApplyCrop={handleApplyCrop}
          completedCrop={completedCrop}
          onResetCrop={() => setCrop(undefined)}
          canvasMode={canvasMode} setCanvasMode={setCanvasMode}
          background={background} setBackground={setBackground}
          onRemoveBackground={handleRemoveBackground}
          isRemovingBg={isRemovingBg}
          borderWidth={borderWidth} setBorderWidth={setBorderWidth}
          borderColor={borderColor} setBorderColor={setBorderColor}
          onReset={handleReset}
        />

        <Canvas
          imageUrl={imageUrl}
          scale={scale}
          rotate={rotate}
          canvasMode={canvasMode}
          background={background}
          crop={crop}
          setCrop={setCrop}
          setCompletedCrop={setCompletedCrop}
          onImageLoad={onImageLoad}
          imgRef={imgRef}
          filterString={getFilterString()}
          borderWidth={borderWidth}
          borderColor={borderColor}
          setScale={setScale}
        />
      </div>
    </div>,
    document.body
  );
};
