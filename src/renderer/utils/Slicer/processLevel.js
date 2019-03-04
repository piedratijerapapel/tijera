import Jimp from 'jimp';

export default function(options, level) {
  return next => {
    new Jimp(level.size, level.size, options.background, (err, img) => {
      let copy = options.baseImg.clone().resize(level.width, level.height);

      options.levelImages[level] = img.blit(copy, level.x, level.y);
      next(err, `Nivel zoom ${level.level}`);
    });
  };
}
