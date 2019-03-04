import S from 'string';
import path from 'path';

export default function(format, z, y, x) {
  return S(format).template(
    {
      z: z,
      y: y,
      x: x,
      google: path.join(String(z), String(y), String(x))
    },
    '{',
    '}'
  ).s;
}
