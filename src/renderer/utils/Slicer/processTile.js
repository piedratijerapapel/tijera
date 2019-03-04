import mkdirp from 'mkdirp';
import path from 'path';

export default function(options, level, tile) {
  return next => {
    const tileFile = `${options.output}/${level.level}/${tile.y}/${tile.x}.jpg`;

    mkdirp(path.dirname(tileFile), function(err) {
      if (err) {
        return next(err);
      }

      const x = tile.x * options.tileSize;
      const y = tile.y * options.tileSize;

      options.levelImages[level]
        .clone()
        .crop(x, y, options.tileSize, options.tileSize)
        .write(tileFile, err => {
          next(err, tileFile);
        });
    });
  };
}
