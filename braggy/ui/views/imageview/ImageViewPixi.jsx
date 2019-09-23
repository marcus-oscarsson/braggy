import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import * as PIXI from 'pixi.js';

import imageBuffer from 'app/utils/buffer';
import ThreeImageView from './ThreeImageView';

import {
  resolutionAt,
  createImageFromBuffer,
  createBeamCenter,
  createResolutionRings
} from './imageviewlib';

const styles = theme => ({
  imageViewContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },
  infoDisplay: {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.6)',
    padding: theme.spacing.unit,
    borderRadius: '4px',
    color: 'rgba(255, 255, 255, 1)',
    display: 'none',
    userSelect: 'none',
  }
});


class ImageView extends React.Component {
  constructor(props) {
    super(props);
    this.autoScale = this.autoScale.bind(this);
    this.initPixi = this.initPixi.bind(this);
    this.renderImageDataPixi = this.renderImageDataPixi.bind(this);
    this.renderImageDataThree = this.renderImageDataThree.bind(this);
    this.renderResolutionRingsPixi = this.renderResolutionRingsPixi.bind(this);

    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDragStart = this.onDragStart.bind(this);

    this.canvasContainerRef = React.createRef();
    this.infoDisplayDivRef = React.createRef();
    this.pixiapp = new PIXI.Application({ transparent: true, roundPixels: true });
    PIXI.settings.SCALE_MODE = 0;
    this.currentImg = null;
    this.container = null;
    this.scale = 1;
    this.mouseOverEvent = null;
    this.zoomMouseX = null;
    this.zoomMouseY = null;

    // THREE
    this.stats = null;
    this.scene = null;
    this.camera = null;
  }

  componentDidMount() {
    // const w = this.canvasContainerRef.current.clientWidth;
    // const h = this.canvasContainerRef.current.clientHeight;

    // this.initPixi(w, h);
    this.threeImageView = new ThreeImageView(this.canvasContainerRef.current);
    // this.threeImageView.init(w, h);
  }

  componentDidUpdate() {
    const { currentImage } = this.props;

    if (imageBuffer.get(currentImage) !== undefined
       && imageBuffer.get(currentImage).raw === undefined) {
      window.fullDataDownloadWorker.postMessage({ path: currentImage });
    }

    this.renderImageDataThree();
    // this.renderImageDataPixi();

    // window.requestAnimationFrame(() => (this.renderImageDataPixi()));
    // window.requestAnimationFrame(() => (this.renderResolutionRingsPixi()));
  }

  // componentWillUnmount() {
  //  this.pixiapp.view.removeEventListener(this.onMouseWheel);
  // }

  onMouseWheel(e) {
    const zoomOutDisabled = this.pixiapp.screen.height >= Math.floor(this.currentImg.height);

    if (e.wheelDelta < 0 && zoomOutDisabled) {
      this.currentImg.x = this.pixiapp.screen.width / 2;
      this.currentImg.y = this.pixiapp.screen.height / 2;

      this.container.x = this.pixiapp.screen.width / 2;
      this.container.y = this.pixiapp.screen.height / 2;
      return;
    }

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

      this.scale += Math.sign(e.wheelDelta) / 2;

      if (this.scale > 20) {
        this.scale = 60;
      }

      if (this.scale === 60 && e.wheelDelta < 0) {
        this.scale = 20;
      }

      this.currentImg.scale.x = this.scale;
      this.currentImg.scale.y = this.scale;

      this.renderResolutionRingsPixi();
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
    const dragEnabled = this.pixiapp.screen.height < Math.floor(this.currentImg.height);

    if (dragEnabled) {
      this.currentImg.dragging = true;
      this.currentImg.dragStartPos = event.data.getLocalPosition(this.currentImg.parent);
      this.currentImg.dragStartOx = this.currentImg.dragStartPos.x - this.currentImg.x;
      this.currentImg.dragStartOy = this.currentImg.dragStartPos.y - this.currentImg.y;
    }
  }

  onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
  }

  onMouseMove(event) {
    const { images, currentImage } = this.props;
    const imgData = images[currentImage];
    const data = imageBuffer.get(currentImage).raw;

    if (this.currentImg.dragging) {
      const newPosition = event.data.getLocalPosition(this.currentImg.parent);
      this.currentImg.x = newPosition.x - this.currentImg.dragStartOx;
      this.currentImg.y = newPosition.y - this.currentImg.dragStartOy;
      this.container.x = newPosition.x - this.currentImg.dragStartOx;
      this.container.y = newPosition.y - this.currentImg.dragStartOy;
    }

    if (this.mouseOverEvent) {
      const hdr = imgData.hdr.braggy_hdr;
      const pos = event.data.getLocalPosition(this.currentImg);
      const x = Math.floor((this.currentImg.width / this.currentImg.scale.x) / 2 + pos.x);
      const y = Math.floor((this.currentImg.height / this.currentImg.scale.y) / 2 + pos.y);
      const w = this.currentImg.width / this.currentImg.scale.x;
      const grey = data ? data[Math.floor(y * w + x)] : '?';
      const cx = ((hdr.img_width / 2 + hdr.beam_ocx) - x) / hdr.pxxpm;
      const cy = ((hdr.img_height / 2 + hdr.beam_ocy) - y) / hdr.pxypm;
      const res = resolutionAt(cx, cy, hdr.detector_distance, hdr.wavelength).toFixed(2);
      this.infoDisplayDivRef.current.style.top = `${event.data.originalEvent.offsetY + 15}px`;
      this.infoDisplayDivRef.current.style.left = `${event.data.originalEvent.offsetX + 15}px`;
      this.infoDisplayDivRef.current.style.display = 'block';
      this.infoDisplayDivRef.current.innerHTML = `X:${x} Y:${y} <br /> Intensity: ${grey} <br /> Resolution ${res}`;
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

  initPixi(w, h) {
    this.pixiapp.view.addEventListener('mousewheel', this.onMouseWheel, false);
    this.canvasContainerRef.current.appendChild(this.pixiapp.view);
    this.pixiapp.renderer.autoResize = true;
    this.pixiapp.renderer.resize(w, h);
  }

  renderImageDataPixi() {
    const { currentImage, images, showFullData } = this.props;
    const { pixiapp } = this;
    const imgData = images[currentImage];

    const hdr = imgData.hdr.braggy_hdr;

    let data = imageBuffer.get(currentImage).img;

    if (imageBuffer.get(currentImage).rgbdata && showFullData) {
      data = imageBuffer.get(currentImage).rgbdata;
    }

    const img = createImageFromBuffer(data, hdr.img_width, hdr.img_height);

    this.autoScale(img);
    this.currentImg = img;

    img.x = pixiapp.screen.width / 2;
    img.y = pixiapp.screen.height / 2;
    img.zIndex = 1;

    img.on('pointerover', this.onMouseOver);
    img.on('pointerout', this.onMouseOut);
    img.on('pointerdown', this.onDragStart);
    img.on('pointerup', this.onDragEnd);
    img.on('pointerupoutside', this.onDragEnd);
    img.on('pointermove', this.onMouseMove);

    pixiapp.stage.addChild(img);
    this.renderResolutionRingsPixi();
    imageBuffer.pop(currentImage);
  }

  renderResolutionRingsPixi() {
    const { images, currentImage, showResolution } = this.props;
    const imgData = images[currentImage];
    const hdr = imgData.hdr.braggy_hdr;
    const { pixiapp } = this;

    if (this.container) {
      pixiapp.stage.removeChild(this.container);
    }

    this.container = new PIXI.Container();
    this.container.x = this.currentImg.x;
    this.container.y = this.currentImg.y;
    this.container.zIndex = 100;

    if (hdr.beam_ocx !== undefined && showResolution) {
      const beamCenter = createBeamCenter(hdr);
      const rings = createResolutionRings(hdr, this.scale);
      this.container.addChild(beamCenter);
      this.container.addChild(...rings);
    }

    pixiapp.stage.addChild(this.container);
  }

  renderImageDataThree() {
    const { currentImage, images } = this.props;
    const imgData = images[currentImage];
    const hdr = imgData.hdr.braggy_hdr;
    const img = imageBuffer.get(currentImage);
    let data = [];

    if (!imgData || img === undefined) {
      return;
    }

    data = img.rgbdata;

    if (!data) {
      return;
    }

    this.threeImageView.setRawData(img.raw);
    this.threeImageView.setImageHdr(
      hdr.beam_ocx, hdr.beam_ocy, hdr.pxxpm, hdr.pxypm,
      hdr.detector_distance, hdr.wavelength
    );

    this.threeImageView.renderImageData(img.rgbdata, hdr.img_width, hdr.img_height);
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div
          id="imageview-container"
          ref={this.canvasContainerRef}
          className={classes.imageViewContainer}
        >
          <div ref={this.infoDisplayDivRef} className={classes.infoDisplay} />
        </div>
      </div>
    );
  }
}


function mapStateToProps({ imageView }) {
  return {
    images: imageView.images,
    currentImage: imageView.currentImage,
    autoScale: imageView.options.autoScale,
    showResolution: imageView.options.showResolution,
    showFullData: imageView.options.showFullData
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(ImageView)
);