import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import classNames from 'classnames';
import Divider from '@material-ui/core/Divider';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';
import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import BlurOffIcon from '@material-ui/icons/BlurOff';

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FileBrowser from 'views/file-browser/FileBrowser';
import ImageView from 'views/imageview/ImageView';

import * as ImageViewActions from 'app/imageview/imageview-actions';

const drawerWidth = 260;

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
  state = {
    open: false,
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      classes,
      fetchImageRequest,
      autoScale,
      progDownload,
      showResolution,
      downloadFull,
      showFullData,
      setOption,
      images,
      app,
      currentImagePath
    } = this.props;

    const {
      open
    } = this.state;

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
        <IconButton
          color="inherit"
          aria-label="Open drawer"
          onClick={this.handleDrawerOpen}
          className={classNames(classes.menuButton, open && classes.hide)}
        >
          <SettingsIcon />
        </IconButton>
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
        <SwipeableDrawer
          className={classes.drawer}
          variant="persistent"
          anchor="right"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
          </div>
          <Divider />
          <div className={classes.optionsForm}>
            <FormLabel component="legend">Options</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={(<Checkbox color="primary" />)}
                label="Auto scale"
                checked={autoScale}
                onChange={(e) => { setOption('autoScale', e.target.checked); }}
              />
              <FormControlLabel
                control={(<Checkbox color="primary" />)}
                label="Progressive download"
                checked={progDownload}
                onChange={(e) => { setOption('progDownload', e.target.checked); }}
              />
              <FormControlLabel
                control={(<Checkbox color="primary" />)}
                label="Show resolution"
                checked={showResolution}
                onChange={(e) => { setOption('showResolution', e.target.checked); }}
              />
              <FormControlLabel
                control={(<Checkbox color="primary" />)}
                label="Download full"
                checked={downloadFull}
                onChange={(e) => { setOption('downloadFull', e.target.checked); }}
              />
            </FormGroup>
          </div>
          <Divider />
          <List>
            <ListItem
              button
              onClick={() => { setOption('showFullData', !showFullData); }}
            >
              <ListItemIcon>{ showFullData ? (<BlurOffIcon />) : (<BlurOnIcon />) }</ListItemIcon>
              <ListItemText primary={showFullData ? 'Sampled data' : 'Full data'} />
            </ListItem>
          </List>
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
            <ImageView />
          </div>
        </main>
      </div>
    );
  }
}

function mapStateToProps({ imageView, app }) {
  return {
    compress: imageView.options.compress,
    autoScale: imageView.options.autoScale,
    progDownload: imageView.options.progDownload,
    showResolution: imageView.options.showResolution,
    downloadFull: imageView.options.downloadFull,
    showFullData: imageView.options.showFullData,
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
