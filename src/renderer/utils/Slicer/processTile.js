import mkdirp from 'mkdirp';
import path from 'path';
import outputResolve from './util/outputResolve';

export default function(options, level, tile) {
  return next => {
    let tileFile = outputResolve(options.output, level.level, tile.y, tile.x);

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
