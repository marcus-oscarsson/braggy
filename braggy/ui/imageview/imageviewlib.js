export default function resolutionRings(dr, dd, wavelength, ddr = 0.05, sr = 0.01) {
  const resRings = [];

  for (let r = sr; r <= dr * 2 + ddr; r += ddr) {
    const res = wavelength / (2 * Math.sin(0.5 * Math.atan(r / dd)));
    resRings.push({ r, res });
  }

  return resRings;
}
