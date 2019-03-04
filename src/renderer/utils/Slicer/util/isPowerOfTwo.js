export default function(x) {
  if (x < 1) {
    return false;
  }
  return (x & (x - 1)) === 0;
}
