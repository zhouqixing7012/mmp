const DEFAULT_POSITION = {
  side: 'right',
  align: 'center',
  gap: 8,
  offsetX: 0,
  offsetY: 0,
  viewportPadding: 8,
};

const VALID_SIDES = new Set(['top', 'right', 'bottom', 'left']);
const VALID_ALIGNS = new Set(['start', 'center', 'end']);

function finiteNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function normalizeAnnotationPosition(position = {}) {
  return {
    side: VALID_SIDES.has(position.side) ? position.side : DEFAULT_POSITION.side,
    align: VALID_ALIGNS.has(position.align) ? position.align : DEFAULT_POSITION.align,
    gap: Math.max(0, finiteNumber(position.gap, DEFAULT_POSITION.gap)),
    offsetX: finiteNumber(position.offsetX, DEFAULT_POSITION.offsetX),
    offsetY: finiteNumber(position.offsetY, DEFAULT_POSITION.offsetY),
    viewportPadding: Math.max(
      0,
      finiteNumber(position.viewportPadding, DEFAULT_POSITION.viewportPadding)
    ),
  };
}

function crossAxisPosition(start, end, floatingSize, align) {
  if (align === 'start') return start;
  if (align === 'end') return end - floatingSize;
  return start + (end - start - floatingSize) / 2;
}

function positionForSide(rect, hotspotSize, config, side) {
  const { width, height } = hotspotSize;

  if (side === 'left' || side === 'right') {
    return {
      left: side === 'right' ? rect.right + config.gap : rect.left - config.gap - width,
      top: crossAxisPosition(rect.top, rect.bottom, height, config.align),
    };
  }

  return {
    left: crossAxisPosition(rect.left, rect.right, width, config.align),
    top: side === 'bottom' ? rect.bottom + config.gap : rect.top - config.gap - height,
  };
}

function oppositeSide(side) {
  if (side === 'top') return 'bottom';
  if (side === 'right') return 'left';
  if (side === 'bottom') return 'top';
  return 'right';
}

function overflowsMainAxis(coords, hotspotSize, viewport, side, padding) {
  if (side === 'right') return coords.left + hotspotSize.width > viewport.width - padding;
  if (side === 'left') return coords.left < padding;
  if (side === 'bottom') return coords.top + hotspotSize.height > viewport.height - padding;
  return coords.top < padding;
}

function fitsMainAxis(coords, hotspotSize, viewport, side, padding) {
  return !overflowsMainAxis(coords, hotspotSize, viewport, side, padding);
}

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export function computeHotspotPosition(rect, viewport, hotspotSize, position = {}) {
  const config = normalizeAnnotationPosition(position);
  let side = config.side;
  let coords = positionForSide(rect, hotspotSize, config, side);

  if (overflowsMainAxis(coords, hotspotSize, viewport, side, config.viewportPadding)) {
    const fallbackSide = oppositeSide(side);
    const fallbackCoords = positionForSide(rect, hotspotSize, config, fallbackSide);
    if (fitsMainAxis(fallbackCoords, hotspotSize, viewport, fallbackSide, config.viewportPadding)) {
      side = fallbackSide;
      coords = fallbackCoords;
    }
  }

  const minLeft = config.viewportPadding;
  const maxLeft = viewport.width - hotspotSize.width - config.viewportPadding;
  const minTop = config.viewportPadding;
  const maxTop = viewport.height - hotspotSize.height - config.viewportPadding;

  return {
    left: clamp(coords.left + config.offsetX, minLeft, maxLeft),
    top: clamp(coords.top + config.offsetY, minTop, maxTop),
    side,
  };
}
