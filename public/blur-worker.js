/**
 * NEUROVA OpenCV-compatible Blur Detection Web Worker.
 * Computes Laplacian variance on notebook image data without blocking main thread.
 * Quality threshold: Laplacian variance >= 10.0 is acceptable.
 */

self.onmessage = function (e) {
  const { imageData, width, height } = e.data;
  if (!imageData || !width || !height) {
    self.postMessage({ error: "Invalid image data provided." });
    return;
  }

  const data = imageData.data;
  const gray = new Float32Array(width * height);

  // 1. Convert RGBA to Grayscale
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // 2. Compute 3x3 Discrete Laplacian convolution
  // Kernel:
  // [ 0,  1,  0 ]
  // [ 1, -4,  1 ]
  // [ 0,  1,  0 ]
  const laplacian = new Float32Array(width * height);
  let sum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x;
      const val =
        gray[idx - width] +
        gray[idx + width] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx];

      laplacian[idx] = val;
      sum += val;
      count++;
    }
  }

  // 3. Compute Mean and Variance
  const mean = sum / count;
  let varianceSum = 0;

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const diff = laplacian[rowOffset + x] - mean;
      varianceSum += diff * diff;
    }
  }

  const variance = varianceSum / count;
  const threshold = 10.0;
  const isBlurry = variance < threshold;

  self.postMessage({
    variance: Math.round(variance * 100) / 100,
    threshold: threshold,
    isBlurry: isBlurry,
    status: isBlurry ? "REJECTED_BLURRY" : "ACCEPTED_CLEAR"
  });
};
