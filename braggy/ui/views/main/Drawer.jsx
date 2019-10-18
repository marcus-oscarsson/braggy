import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Snackbar from '@material-ui/core/Snackbar';
import Fade from '@material-ui/core/Fade';

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FileBrowser from 'views/file-browser/FileBrowser';
import ReactImageView from 'views/imageview/ReactImageView';

import * as ImageViewActions from 'app/imageview/imageview-actions';

const drawerWidth = 300;

const styles = theme => ({
  root: {
    display: 'flex'
  },
  drawer: {
    width: drawerWidth
  },
  drawerPaper: {
    width: drawerWidth
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    background: '#ffffff'
  },
  content: {
    padding: theme.spacing.unit * 3
  },
  optionsForm: {
    padding: theme.spacing.unit * 2
  },
  imageViewContainer: {
    position: 'absolute',
    left: '10px',
    right: '10px',
    top: '10px',
    bottom: '10px',
    overflow: 'hidden'
  },
  toolbar: theme.mixins.toolbar,
  snackBar: {
    bottom: '2em'
  },
  menuButton: {
    position: 'fixed',
    zIndex: 1,
    right: '0.5em',
    top: '0.5em'
  },
  hide: {
    display: 'none',
  },

});


class ResponsiveDrawer extends React.Component {
  componentDidUpdate() {
    // debugger;

    // if (window.twoDImageView.data) {
    //   debugger;
    //   const d = window.twoDImageView.data;
    //   const x = {};
    //   // const y = [];

    //   for (let i = 0; i <= d.length; i += 1) {
    //     if (x[d[i]] !== undefined) {
    //       x[d[i]] += 1;
    //     } else {
    //       x[d[i]] = 0;
    //     }
    //   }

    //   debugger;

    //   const trace = {
    //     x: Object.keys(x),
    //     y: Object.values(x),
    //     type: 'histogram',
    //     histfunc: 'count',
    //     histnorm: 'density',
    //     autobinx: false,
    //     xbins: {
    //       end: 10000,
    //       size: 1,
    //       start: -2
    //     },
    //   };

    //   const data = [trace];
    //   Plotly.newPlot('histogram', data);
    // }
  }

  log10 = value => ([Math.log(value[0]) / Math.log(10), Math.log(value[1]) / Math.log(10)])

  pow10 = x => (x ** 10)

  valueLabelFormat = (x) => {
    const [coefficient, exponent] = this.pow10(x)
      .toExponential()
      .split('e')
      .map(item => Number(item));
    return `${Math.round(coefficient)}e^${exponent}`;
  }

  render() {
    const {
      classes,
      images,
      app,
      fetchImageRequest,
      currentImagePath
    } = this.props;

    const drawer = (
      <div>
        <List>
          <FileBrowser
            onFileClick={fetchImageRequest}
            downloadedFiles={images}
          />
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <CssBaseline />
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <SwipeableDrawer
          variant="persistent"
          anchor="left"
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper
          }}
          open={!app.follow}
        >
          {drawer}
        </SwipeableDrawer>
        <Snackbar
          className={classes.snackBar}
          open={app.follow}
          onClose={this.handleClose}
          TransitionComponent={Fade}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={(
            <span id="message-id">
              Following:
              {currentImagePath}
            </span>)}
        />
        <main className={classes.content}>
          <div className={classes.imageViewContainer}>
            <ReactImageView
              currentImage={currentImagePath}
            />
          </div>
        </main>
      </div>
    );
  }
}

function mapStateToProps({ imageView, app }) {
  return {
    options: imageView.options,
    currentImagePath: imageView.currentImage,
    images: imageView.images,
    app
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(ImageViewActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(ResponsiveDrawer)
);
