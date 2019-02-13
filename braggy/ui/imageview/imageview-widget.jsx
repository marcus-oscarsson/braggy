import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import * as PIXI from 'pixi.js';

// import bgGrid from '../img/bg-grid.svg';

import Worker from './image-download.worker';


const styles = () => ({
  imageViewContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  },
  infoDisplay: {
    position: 'absolute'
  }
});


class ImageView extends React.Component {
  constructor(props) {
    super(props);
    this.loadImageData = this.loadImageData.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.canvasContainerRef = React.createRef();
    this.infoDisplayDivRef = React.createRef();
    this.pixiapp = new PIXI.Application({ transparent: true });
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
    const { currentImage } = this.props;
    const prevImage = prevProps.currentImage;

    // Only load image data if image changed.
    if (currentImage !== prevImage) {
      window.requestAnimationFrame(() => (this.loadImageData()));
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
    this.infoDisplayDivRef.current.innerHTML = '';
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

    if (this.currentImg.dragging) {
      const newPosition = event.data.getLocalPosition(this.currentImg.parent);
      this.currentImg.x = newPosition.x - this.currentImg.dragStartOx;
      this.currentImg.y = newPosition.y - this.currentImg.dragStartOy;
      this.container.x = newPosition.x - this.currentImg.dragStartOx;
      this.container.y = newPosition.y - this.currentImg.dragStartOy;
    }

    if (this.mouseOverEvent) {
      const pos = event.data.getLocalPosition(this.currentImg);
      const x = Math.floor((this.currentImg.width / this.currentImg.scale.x) / 2 + pos.x);
      const y = Math.floor((this.currentImg.height / this.currentImg.scale.y) / 2 + pos.y);
      const w = this.currentImg.width / this.currentImg.scale.x;
      const grey = imgData.raw ? imgData.raw[Math.floor(y * w + x)] : '?';

      this.infoDisplayDivRef.current.innerHTML = `X:${x} Y:${y} Intensity: ${grey}`;
    }
  }

  imgLoaded(sprite, _img) {
    const img = _img;
    const { autoScale } = this.props;
    const ratio = this.pixiapp.screen.height / _img.height;

    if (autoScale) {
      img.scale.x = ratio;
      img.scale.y = ratio;
    }
  }

  loadImageData() {
    const { images, currentImage } = this.props;
    const imgData = images[currentImage];

    const { pixiapp } = this;

    pixiapp.stage.removeChildren();

    const img = new PIXI.Sprite.from(imgData.data);
    img.texture.baseTexture.on('loaded', e => (this.imgLoaded(e, img)));

    img.interactive = true;

    img.anchor.set(0.5);
    img.x = pixiapp.screen.width / 2;
    img.y = pixiapp.screen.height / 2;

    this.container = new PIXI.Container();
    this.container.x = img.x;
    this.container.y = img.y;

    const pixiCircle = new PIXI.Graphics();
    pixiCircle.lineStyle(2, 0xFF00FF);
    pixiCircle.drawCircle(0, 0, 10);
    pixiCircle.endFill();
    this.container.addChild(pixiCircle);

    img.on('added', this.onAdded);
    img.on('pointerover', this.onMouseOver);
    img.on('pointerout', this.onMouseOut);

    img.on('pointerdown', this.onDragStart);
    img.on('pointerup', this.onDragEnd);
    img.on('pointerupoutside', this.onDragEnd);
    img.on('pointermove', this.onMouseMove);

    this.currentImg = img;

    pixiapp.stage.addChild(img);
    pixiapp.stage.addChild(this.container);
  }

  render() {
    const { classes } = this.props;

    const worker = new Worker();
    worker.postMessage({ msg: 'hello' });

    return (
      <div
        id="imageview-container"
        ref={this.canvasContainerRef}
        className={classes.imageViewContainer}
      >
        <div ref={this.infoDisplayDivRef} className={classes.infoDisplay} />
      </div>
    );
  }
}


function mapStateToProps({ imageView }) {
  return {
    images: imageView.images,
    currentImage: imageView.currentImage,
    autoScale: imageView.options.autoScale
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(ImageView)
);
