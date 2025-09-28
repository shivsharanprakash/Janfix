// Simple ML service stub for severity estimation and before/after comparison
// In production, replace with real model inference.

async function estimateSeverity(report) {
  // Use signals: predictedCategory, description length, number of images
  const textLen = (report.description || '').length;
  const numImages = (report.media || []).filter(m => m.type === 'image').length;
  // crude heuristic 0..1
  const score = Math.max(0, Math.min(1, (numImages * 0.2) + (textLen > 140 ? 0.5 : textLen > 40 ? 0.3 : 0.1)));
  return score;
}

async function compareBeforeAfter(beforeMedia, afterMedia) {
  // Basic heuristic: if there is at least one after image and count increased, mark improved
  const beforeCount = (beforeMedia || []).filter(m => m.type === 'image').length;
  const afterCount = (afterMedia || []).filter(m => m.type === 'image').length;
  const confidence = afterCount > 0 ? Math.min(1, 0.6 + 0.1 * afterCount) : 0;
  const improved = afterCount > 0 && afterCount >= beforeCount;
  return { improved, confidence };
}

module.exports = { estimateSeverity, compareBeforeAfter };









