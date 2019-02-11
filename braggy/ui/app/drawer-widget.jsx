import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FileBrowser from '../file-browser/file-browser-widget';
import ImageView from '../imageview/imageview-widget';

import * as ImageViewAPI from '../imageview/imageview-api';

const drawerWidth = 240;

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
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  content: {
    padding: theme.spacing.unit * 3
  },
  optionsForm: {
    padding: theme.spacing.unit * 2
  },
  imageViewContainer: {
    position: 'absolute',
    left: `${drawerWidth + 10}px`,
    right: '10px',
    top: '10px',
    bottom: '10px',
    overflow: 'hidden'
  },
  toolbar: theme.mixins.toolbar
});


class ResponsiveDrawer extends React.Component {
  toggleDrawer(side, open) {
    return () => this.setState({ [side]: open });
  }

  render() {
    const {
      classes,
      fetchImageRequest,
      compress,
      autoScale,
      aggDownload,
      setOption,
      images
    } = this.props;

    const drawer = (
      <div>
        <div className={classes.optionsForm}>
          <FormLabel component="legend">Options</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={(<Checkbox color="primary" />)}
              label="Compress image"
              checked={compress}
              onChange={(e) => { setOption('compress', e.target.checked); }}
            />
            <FormControlLabel
              control={(<Checkbox color="primary" />)}
              label="Auto scale"
              checked={autoScale}
              onChange={(e) => { setOption('autoScale', e.target.checked); }}
            />
            <FormControlLabel
              control={(<Checkbox color="primary" />)}
              label="Progressive download"
              checked={aggDownload}
              onChange={(e) => { setOption('aggDownload', e.target.checked); }}
            />
          </FormGroup>
        </div>
        <Divider />
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
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
          open
        >
          {drawer}
        </Drawer>
        <main className={classes.content}>
          <div className={classes.imageViewContainer}>
            <ImageView />
          </div>
        </main>
      </div>
    );
  }
}

function mapStateToProps({ imageView }) {
  return {
    compress: imageView.options.compress,
    autoScale: imageView.options.autoScale,
    aggDownload: imageView.options.aggDownload,
    images: imageView.images
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(ImageViewAPI, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(ResponsiveDrawer)
);
