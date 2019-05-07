import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import ReactEcharts from 'echarts-for-react';

import Worker from 'views/imageview/image-download.worker';


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
  getOptions() {
    return {
      tooltip: {},
      xAxis: {
        type: 'category',
        data: xData
      },
      yAxis: {
        type: 'category',
        data: yData
      },
      dataZoom: [{
        type: 'slider',
        height: 8,
        bottom: 20,
        borderColor: 'transparent',
        backgroundColor: '#e2e2e2',
        handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', // jshint ignore:line
        handleSize: 20,
        handleStyle: {
          shadowBlur: 6,
          shadowOffsetX: 1,
          shadowOffsetY: 2,
          shadowColor: '#aaa'
        }
      }, {
        type: 'inside'
      }],
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        realtime: false,
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
      },
      series: [{
        name: 'Gaussian',
        type: 'heatmap',
        data: imageData.raw,
        itemStyle: {
          emphasis: {
            borderColor: '#333',
            borderWidth: 1
          }
        },
        progressive: 1000,
        animation: false
      }]
    };
  }

  render() {
    const { images, currentImage } = this.props;
    const imgData = images[currentImage];

    console.log(images);
    console.log(currentImage);
    console.log(imgData);

    const { classes } = this.props;

    const worker = new Worker();
    worker.postMessage({ msg: 'hello' });

    return (
      <div
        id="imageview-container"
        className={classes.imageViewContainer}
      >
        <ReactEcharts
          option={this.getOption()}
          notMerge
          lazyUpdate
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
