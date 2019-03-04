import * as PIXI from 'pixi.js';

export function resolutionRings(dr, dd, wavelength, ddr = 0.03, sr = 0.01) {
  const resRings = [];

  for (let r = sr; r <= dr; r += ddr) {
    const dhalf = r * Math.PI;
    const res = wavelength / (2 * Math.sin(0.5 * Math.atan(dhalf / dd)));
    resRings.push({ r, res });
  }

  return resRings;
}


export function resolutionAt(x, y, dd, wavelength) {
  const dhalf = Math.sqrt(x * x + y * y) * Math.PI;
  return wavelength / (2 * Math.sin(0.5 * Math.atan(dhalf / dd)));
}


export function createImage(data) {
  const img = new PIXI.Sprite.from(data);

  img.interactive = true;
  img.anchor.set(0.5);

  return img;
}

export function createBeamCenter(hdr) {
  const pixiCircle = new PIXI.Graphics();
  pixiCircle.lineStyle(1, 0xFF00FF, 0.2);
  pixiCircle.drawCircle(hdr.beam_ocx, hdr.beam_ocy, 3);
  pixiCircle.endFill();
  return pixiCircle;
}


export function createResolutionRings(hdr) {
  const pixiCircle = new PIXI.Graphics();
  const el = [];
  pixiCircle.lineStyle(1, 0xFF00FF, 0.2);
  pixiCircle.endFill();

  el.push(pixiCircle);

  const rings = resolutionRings(hdr.detector_radius, hdr.detector_distance, hdr.wavelength);

  rings.forEach((ring) => {
    const rx = ring.r * hdr.pxypm;

    pixiCircle.drawCircle(hdr.beam_ocx, hdr.beam_ocy, rx);

    const t = new PIXI.Text(`${ring.res.toFixed(2).toString()} A`,
      {
        fontFamily: 'Arial',
        fontSize: 45,
        fill: 0xff1010,
        align: 'center'
      });

    t.x = hdr.beam_ocx + rx + 20;
    t.y = hdr.beam_ocy;
    t.anchor.set(0.5);
    t.alpha = 0.7;

    el.push(t);
  });

  return el;
}
