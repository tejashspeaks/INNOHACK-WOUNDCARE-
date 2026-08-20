/**
 * Client-Side Image Preprocessing & Compression Engine
 * Optimizes high-resolution raw camera uploads (5-15MB) into lightweight, high-fidelity
 * VLM tensors (~100-250KB) in <20ms to minimize network transfer and end-to-end triage latency.
 */

export interface CompressionResult {
  compressedBase64: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionRatioPercent: number;
  compressionTimeMs: number;
  width: number;
  height: number;
}

export async function optimizeImageForVLM(
  source: File | string,
  maxDimension = 1024,
  quality = 0.85
): Promise<CompressionResult> {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let originalSizeBytes = 0;

    if (typeof source === 'string') {
      srcUrl = source;
      originalSizeBytes = Math.round(source.length * 0.75);
    } else {
      srcUrl = URL.createObjectURL(source);
      originalSizeBytes = source.size;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });

      if (!ctx) {
        if (typeof source !== 'string') URL.revokeObjectURL(srcUrl);
        reject(new Error('Failed to get 2D canvas context for compression'));
        return;
      }

      // Draw image onto canvas with high quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as optimized JPEG
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      const compressedSizeBytes = Math.round(compressedBase64.length * 0.75);
      const compressionTimeMs = Math.round(performance.now() - startTime);
      const reductionRatioPercent = originalSizeBytes > 0
        ? Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
        : 0;

      if (typeof source !== 'string') {
        URL.revokeObjectURL(srcUrl);
      }

      resolve({
        compressedBase64,
        originalSizeBytes,
        compressedSizeBytes,
        reductionRatioPercent: Math.max(0, reductionRatioPercent),
        compressionTimeMs,
        width,
        height
      });
    };

    img.onerror = (err) => {
      if (typeof source !== 'string') URL.revokeObjectURL(srcUrl);
      reject(err);
    };

    img.src = srcUrl;
  });
}
