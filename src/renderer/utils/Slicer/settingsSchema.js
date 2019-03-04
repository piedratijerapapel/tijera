import joi from 'joi';
import def from './defaultSettings';

export default joi
  .object({
    tileSize: joi
      .number()
      .integer()
      .min(1)
      .default(def.tileSize)
      .description('Has to be a power of 2'),
    parallelLimit: joi
      .number()
      .integer()
      .min(1)
      .default(def.parallelLimit)
      .description('Amount of parallel tasks that are run'),
    background: joi
      .string()
      .default(def.background)
      .description('Color to be used outside of the image'),
    output: joi.string(),
    outputFolder: joi.string(),
    file: joi.string().required(),
    minWidth: joi.number().integer(),
    minHeight: joi.number().integer()
  })
  .unknown();
