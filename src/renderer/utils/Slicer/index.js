import fs from 'fs';
import events from 'events';
import async from 'async';
import util from 'util';
import Jimp from 'jimp';
import calculateLevelData from './util/calculateLevelData';
import buildOptions from './util/buildOptions';
import isPowerOfTwo from './util/isPowerOfTwo';
import processLevel from './processLevel';
import processTile from './processTile';
import settingsSchema from './settingsSchema';

export default class MapSlicer {
  constructor(options) {
    let opts = settingsSchema.validate(options);

    if (opts.error) {
      this.emit('error', opts.error);
      return;
    }
    this.options = opts.value;
    this.setup();
  }

  start() {
    let options = this.options;

    if (!options.file) {
      this.emit('error', new Error('Error#5: Target file required.'));
      return;
    }

    if (!isPowerOfTwo(options.tileSize)) {
      this.emit(
        'error',
        new Error('Error#6: TileSize is not power of 2 like: 128, 256, etc.')
      );
      return;
    }

    this.startProcess();
  }

  setOutputFolder(url) {
    this.options.output = url;
  }

  setup() {
    fs.exists(this.options.file, exists => {
      if (exists) {
        this.emit('loading', this.options.file);

        setTimeout(() => {
          Jimp.read(this.options.file)
            .then(img => {
              const w = img.bitmap.width;
              const h = img.bitmap.height;
              this.options = buildOptions(img, w, h, this.options);
              this.tasks = this.collectTasks(w, h);
            })
            .catch(err => {
              this.emit('error', this.options.file);
            });
        }, 500);
      } else {
        this.emit('error', this.options.file);
      }
    });
  }

  startProcess() {
    this.emit('start', this.totalTasks, this.options);

    async.series(this.tasks, () => {
      this.emit('end');
    });
  }

  wrapProgressTask(task) {
    this.totalTasks++;

    return next => {
      task((error, result) => {
        this.executedTasks++;
        this.emit(
          'progress',
          this.executedTasks / this.totalTasks,
          this.totalTasks,
          this.executedTasks,
          result
        );
        if (error) {
          this.emit('error', error);
        }
        next(error, result);
      });
    };
  }

  collectTasks(imageWidth, imageHeight) {
    let levels = calculateLevelData(imageWidth, imageHeight, this.options);
    this.emit('levels', levels);

    let tasks = [];
    this.totalTasks = 0;
    this.executedTasks = 0;

    levels.forEach((level, i) => {
      let levelTasks = [];
      let tiles = level.tiles;

      this.options.levelImages[i] = null;

      tasks.push(this.wrapProgressTask(processLevel(this.options, level)));

      tiles.forEach(tile => {
        levelTasks.push(
          this.wrapProgressTask(processTile(this.options, level, tile))
        );
      });

      tasks.push(this.makeParallel(levelTasks));
    });

    this.emit('tasks', this.totalTasks - levels.length, tasks);

    return tasks;
  }

  makeParallel(tasks) {
    return next => {
      if (this.options.parallelLimit === 0) {
        async.parallel(tasks, next);
      } else {
        async.parallelLimit(tasks, this.options.parallelLimit, next);
      }
    };
  }
}

util.inherits(MapSlicer, events.EventEmitter);
