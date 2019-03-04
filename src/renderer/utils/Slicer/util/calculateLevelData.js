import pow2roundup from './pow2roundup';
import getPowerTwo from './getPowerTwo';

export default function(imageWidth, imageHeight, options) {
  let width = options.minWidth;
  let height = options.minHeight;
  let tileAmount = pow2roundup(
    Math.max(
      Math.ceil(width / options.tileSize),
      Math.ceil(height / options.tileSize)
    )
  );
  let zoomLevels = [];
  let zoomLevel = getPowerTwo(tileAmount);

  while (width <= imageWidth && height <= imageHeight) {
    let tiles = [];
    let xStart = Math.round(width / 2) - (tileAmount / 2) * options.tileSize;
    let yStart = Math.round(height / 2) - (tileAmount / 2) * options.tileSize;
    let xCountStart = 0;
    let yCountStart = 0;
    let xCountEnd = tileAmount;
    let yCountEnd = tileAmount;
    let xOffset = -xStart;
    let yOffset = -yStart;

    for (
      let yCount = yCountStart, y = yStart;
      yCount < yCountEnd;
      ++yCount, y += options.tileSize
    ) {
      for (
        let xCount = xCountStart, x = xStart;
        xCount < xCountEnd;
        ++xCount, x += options.tileSize
      ) {
        tiles.push({
          x: xCount,
          y: yCount,
          tile: {
            x: x,
            y: y
          }
        });
      }
    }
    zoomLevels.push({
      scale: width / imageWidth,
      width: width,
      height: height,
      x: xOffset,
      y: yOffset,
      size: options.tileSize * tileAmount,
      tiles: tiles,
      level: zoomLevel
    });
    width = width << 1;
    height = height << 1;
    tileAmount = tileAmount << 1;
    zoomLevel++;
  }

  return zoomLevels;
}
