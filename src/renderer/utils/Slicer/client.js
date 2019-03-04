import MapSlicer from '.';
import path from 'path';

export default function(options) {
  let mapSlicer = new MapSlicer(options);

  mapSlicer.on('start', function(files, options) {
    console.info('Starting to process ' + files + ' files.');
    console.info(
      'Single Tile Size: ' + options.tileSize + 'x' + options.tileSize + 'px'
    );
  });

  mapSlicer.on('levels', function(levels) {
    for (let i = 0; i < levels.length; ++i) {
      let level = levels[i];
      console.info(
        'Level #' +
          level.level +
          ': ' +
          level.size +
          'x' +
          level.size +
          ', ' +
          level.width +
          'x' +
          level.height
      );
    }
  });

  mapSlicer.on('inputSize', function(width, height) {
    console.info('Input Size: ' + width + 'x' + height);
  });

  mapSlicer.on('error', function(err) {
    process.stdout.write('\n');
    console.error(err);
  });

  mapSlicer.on('progress', function(progress, total, current, file) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let parts = 20;
    let result = 'Progress: [';
    let step = 1 / parts;
    for (let i = 1 / parts; i < 1; i += step) {
      result += i < progress ? '#' : ' ';
    }
    process.stdout.write(
      result +
        '] ' +
        Math.round(progress * 100) +
        '%  - Image ' +
        current +
        ' of ' +
        total +
        ' ' +
        (file ? path.relative('.', file) : '')
    );
  });

  mapSlicer.on('end', function() {
    process.stdout.write('\n');
    console.info('Finished processing slices.');
  });

  mapSlicer.start();
}
