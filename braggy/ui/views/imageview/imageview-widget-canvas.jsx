import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import bgGrid from '../img/bg-grid.svg';
import * as PIXI from 'pixi.js';


import Worker from 'views/imageview/image-download.worker';

const styles = () => ({
  imageViewContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  }
});

function loadImageFromPath(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ status: 'ok', img });
    img.onerror = () => resolve({ status: 'error', img });

    img.src = path;
  });
}

function loadImageFromData(data) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ status: 'ok', img });
    img.onerror = () => resolve({ status: 'error', img });

    img.src = URL.createObjectURL(data);
  });
}

class ImageView extends React.Component {
  state = {
    zoom: 1
  };

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.canvasContainerRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
    this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);
  }

  componentDidMount() {
    const canvas = document.getElementById('image-view-canvas');
    canvas.addEventListener('mousewheel', this.handleScroll, false);
    this.loadImageData();
  }

  componentDidUpdate() {
    this.loadImageData();
  }

  componentWillUnmount() {
    const canvas = document.getElementById('image-view-canvas');
    canvas.removeEventListener(this.handleScroll);
  }

  onMouseMoveHandler(e) {
    const canvas = this.canvasRef.current;

    const brect = canvas.getBoundingClientRect();
    const x = e.clientX - brect.left;
    const y = e.clientY - brect.top;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(x, y, 1, 1).data;
    const imd = ctx.createImageData(1, 1);
    imd.data[0] = 255;
    imd.data[1] = 0;
    imd.data[2] = 0;
    imd.data[3] = 255;

    const grey = (0.299 * imgData[0] + 0.587 * imgData[1] + 0.114 * imgData[2]);
    // ctx.putImageData(imd, x, y);
    //console.log(grey);
    return e;
    // console.log(e);
    // this.setState({ m: [e.x, e.y] });
  }

  loadImageData() {
    const { images, currentImage } = this.props;
    const imgData = images[currentImage];

    const temp = [loadImageFromPath(bgGrid), { img: null, result: 'error' }];

    if (imgData) {
      temp[1] = loadImageFromData(imgData.data);
    }

    const loaded = Promise.all(temp);
    loaded.then((values) => {
      this.bgImg = values[0].img;
      this.dImg = values[1].img;
      this.renderImageView();
    });
  }

  handleScroll(e) {
    const { zoom } = this.state;
    this.setState({ zoom: zoom + (1 * e.wheelDelta * 0.001) });
    window.requestAnimationFrame(() => (this.renderImageView()));
  }

  renderImageView() {
    const { autoScale } = this.props;
    const { zoom } = this.state;
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    const canvasContainer = this.canvasContainerRef.current;

    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;

    ctx.drawImage(this.bgImg, 0, 0, canvas.width, canvas.height);
    const height = window.innerHeight - 50;

    if (this.dImg) {
      const ratio = height / this.dImg.height;
      let w = this.dImg.width;
      let h = this.dImg.height;

      if (autoScale) {
        w *= ratio;
        h *= ratio;
      }

      const ox = (canvas.width - w) / 2;
      const oy = (canvas.height - h) / 2;

      ctx.save();
      ctx.translate(ox, oy);
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(this.dImg, 0, 0, w, h);
      ctx.restore();
    }
  }

  render() {
    const { classes } = this.props;

    const worker = new Worker();
    worker.postMessage({ msg: 'hello' });

    return (
      <div
        ref={this.canvasContainerRef}
        className={classes.imageViewContainer}
      >
        <canvas
          onMouseMove={this.onMouseMoveHandler}
          ref={this.canvasRef}
          id="image-view-canvas"
          className="image-view-canvas"
        />
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
