import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import * as PIXI from 'pixi.js';

import imageBuffer from '../app/buffer';

import {
  resolutionAt,
  createImage,
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
    display: 'none'
  }
});


class ImageView extends React.Component {
  constructor(props) {
    super(props);
    this.autoScale = this.autoScale.bind(this);
    this.renderImageData = this.renderImageData.bind(this);
    this.renderResolutionRings = this.renderResolutionRings.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.canvasContainerRef = React.createRef();
    this.infoDisplayDivRef = React.createRef();
    this.pixiapp = new PIXI.Application({ transparent: true, roundPixels: true });
    PIXI.settings.SCALE_MODE = 0;
    this.currentImg = null;
    this.container = null;
    this.scale = 1;
    this.mouseOverEvent = null;
  }

  componentDidMount() {
    const w = this.canvasContainerRef.current.clientWidth;
    const h = this.canvasContainerRef.current.clientHeight;
    this.pixiapp.view.addEventListener('mousewheel', this.onMouseWheel, false);
    this.canvasContainerRef.current.appendChild(this.pixiapp.view);

    this.pixiapp.renderer.autoResize = true;
    this.pixiapp.renderer.resize(w, h);
  }

  componentDidUpdate(prevProps) {
    const { currentImage, showResolution } = this.props;
    const prevImage = prevProps.currentImage;
    const prevShowResolution = prevProps.showResolution;

    // Only load image data if image changed.
    if (currentImage !== prevImage) {
      window.requestAnimationFrame(() => (this.renderImageData()));
    }

    if (prevShowResolution !== showResolution) {
      window.requestAnimationFrame(() => (this.renderResolutionRings()));
    }
  }

  componentWillUnmount() {
    this.pixiapp.view.removeEventListener(this.onMouseWheel);
  }

  onMouseWheel(e) {
    if (this.mouseOverEvent) {
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

  renderImageData() {
    const { currentImage } = this.props;
    const { pixiapp } = this;

    pixiapp.stage.removeChildren();

    const data = imageBuffer.get(currentImage).img;
    let img = null;

    img = createImage(data);

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
    this.renderResolutionRings();
    imageBuffer.pop(currentImage);
  }

  renderResolutionRings() {
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
    this.container.scale.x = this.scale;
    this.container.scale.y = this.scale;
    this.container.zIndex = 100;

    if (hdr.beam_ocx !== undefined && showResolution) {
      const beamCenter = createBeamCenter(hdr);
      const rings = createResolutionRings(hdr);
      this.container.addChild(beamCenter);
      this.container.addChild(...rings);
    }

    pixiapp.stage.addChild(this.container);
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
    showResolution: imageView.options.showResolution
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(ImageView)
);
