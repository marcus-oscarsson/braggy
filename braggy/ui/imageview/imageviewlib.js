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

export function createImageFromBuffer(data, width, height) {
  const img = new PIXI.Sprite.from(PIXI.Texture.fromBuffer(data, width, height));

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


export function createResolutionRings(hdr, scale = 1) {
  const pixiCircle = new PIXI.Graphics();
  const el = [];
  pixiCircle.lineStyle(1, 0xFF00FF, 0.2);
  pixiCircle.endFill();

  el.push(pixiCircle);

  const rings = resolutionRings(hdr.detector_radius, hdr.detector_distance, hdr.wavelength);

  rings.forEach((ring) => {
    const rx = ring.r * hdr.pxypm;

    pixiCircle.drawCircle(hdr.beam_ocx, hdr.beam_ocy, rx * scale);

    const t = new PIXI.Text(`${ring.res.toFixed(2).toString()} A`,
      {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xff1010,
        align: 'center'
      });

    t.x = (hdr.beam_ocx + rx * scale + 30);
    t.y = hdr.beam_ocy;
    t.anchor.set(0.5);
    t.alpha = 0.7;

    el.push(t);
  });

  return el;
}

export class PIXIImageView {
/**
* Creates an ImageView
* @param {options} - Options object
*/
  constructor() {
    PIXI.settings.SCALE_MODE = 0;
    this.parentEl = null;

    this.container = null;
    this.scale = 1;
    this.mouseOverEvent = null;
    this.zoomMouseX = null;
    this.zoomMouseY = null;

    this.imgRawData = null;
    this.imgMetaData = null;
    this.img = null;

    this.autoScale = this.autoScale.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.pixiapp = new PIXI.Application({ transparent: true, roundPixels: true });
    this.pixiapp.view.addEventListener('mousewheel', this.onMouseWheel, false);
  }

  onMouseWheel(e) {
    if (this.mouseOverEvent) {
      if (this.zoomMouseX !== e.offsetX && this.zoomMouseY !== e.offsetY) {
        this.zoomMouseX = e.offsetX;
        this.zoomMouseY = e.offsetY;
        const dx = (this.pixiapp.screen.width / 2) - e.offsetX;
        const dy = (this.pixiapp.screen.height / 2) - e.offsetY;

        this.currentImg.x += dx;
        this.currentImg.y += dy;
        this.container.x += dx;
        this.container.y += dy;
      }

      this.scale += (e.wheelDelta * 0.001);
      this.currentImg.scale.x = this.scale;
      this.currentImg.scale.y = this.scale;
      this.container.scale.x = this.scale;
      this.container.scale.y = this.scale;
    }
  }

  onMouseOver(e) {
    this.mouseOverEvent = e;
  }

  onMouseOut() {
    this.mouseOverEvent = null;
    this.infoDisplayDivRef.current.style.display = 'none';
  }

  onDragStart(event) {
    this.dragging = true;
    this.dragStartPos = event.data.getLocalPosition(this.parent);
    this.dragStartOx = this.dragStartPos.x - this.x;
    this.dragStartOy = this.dragStartPos.y - this.y;

    return event;
  }

  onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;
  }

  onMouseMove(event) {
    if (this.currentImg.dragging) {
      const newPosition = event.data.getLocalPosition(this.currentImg.parent);
      this.currentImg.x = newPosition.x - this.currentImg.dragStartOx;
      this.currentImg.y = newPosition.y - this.currentImg.dragStartOy;
      this.container.x = newPosition.x - this.currentImg.dragStartOx;
      this.container.y = newPosition.y - this.currentImg.dragStartOy;
    }

    if (this.mouseOverEvent) {
      const hdr = this.imgMetaData.hdr.braggy_hdr;
      const pos = event.data.getLocalPosition(this.currentImg);
      const x = Math.floor((this.currentImg.width / this.currentImg.scale.x) / 2 + pos.x);
      const y = Math.floor((this.currentImg.height / this.currentImg.scale.y) / 2 + pos.y);
      const w = this.currentImg.width / this.currentImg.scale.x;
      const intensity = this.rawData ? this.rawData[Math.floor(y * w + x)] : '?';
      const cx = ((hdr.img_width / 2 + hdr.beam_ocx) - x) / hdr.pxxpm;
      const cy = ((hdr.img_height / 2 + hdr.beam_ocy) - y) / hdr.pxypm;
      const res = resolutionAt(cx, cy, hdr.detector_distance, hdr.wavelength).toFixed(2);

      this.infoDisplayDivRef.current.style.top = `${event.data.originalEvent.offsetY + 15}px`;
      this.infoDisplayDivRef.current.style.left = `${event.data.originalEvent.offsetX + 15}px`;
      this.infoDisplayDivRef.current.style.display = 'block';
      this.infoDisplayDivRef.current.innerHTML = `X:${x} Y:${y} <br /> Intensity: ${intensity} <br /> Resolution ${res}`;
    }
  }

  autoScale(img) {
    if (img.width > 1) {
      const image = img;
      const { autoScale } = this.props;
      const ratio = this.pixiapp.screen.height / image.height;

      if (autoScale) {
        image.scale.x = ratio;
        image.scale.y = ratio;
        this.scale = ratio;
      }
    }
  }

  renderImageData(imgData) {
    const img = createImage(imgData);
    this.currentImg = img;

    this.pixiapp.stage.removeChildren();
    this.autoScale(img);

    img.x = this.pixiapp.screen.width / 2;
    img.y = this.pixiapp.screen.height / 2;
    img.zIndex = 1;

    img.on('pointerover', this.onMouseOver);
    img.on('pointerout', this.onMouseOut);
    img.on('pointerdown', this.onDragStart);
    img.on('pointerup', this.onDragEnd);
    img.on('pointerupoutside', this.onDragEnd);
    img.on('pointermove', this.onMouseMove);

    this.pixiapp.stage.addChild(img);
    this.renderResolutionRings();
  }

  renderResolutionRings(showResolution) {
    const hdr = this.imgMetaData.hdr.braggy_hdr;

    if (this.container) {
      this.pixiapp.stage.removeChild(this.container);
    }

    this.container = new PIXI.Container();
    this.container.x = this.currentImg.x;
    this.container.y = this.currentImg.y;
    this.container.scale.x = this.scale;
    this.container.scale.y = this.scale;
    this.container.zIndex = 100;

    if (hdr.beam_ocx !== undefined && showResolution) {
      const beamCenter = createBeamCenter(hdr);
      const rings = createResolutionRings(hdr);
      this.container.addChild(beamCenter);
      this.container.addChild(...rings);
    }

    this.pixiapp.stage.addChild(this.container);
  }

  resize(w, h, autoResize = true) {
    this.pixiapp.renderer.autoResize = autoResize;
    this.pixiapp.renderer.resize(w, h);
  }

  attatchTo(el) {
    el.appendChild(this.pixiapp.view);
    this.parentEl = el;
  }
}
