import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import classNames from 'classnames';
import Divider from '@material-ui/core/Divider';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';
import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

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
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
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
      options,
      setOption,
      images,
      app,
      fetchImageRequest,
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
                label="Show resolution"
                checked={options.showResolution}
                onChange={(e) => { setOption('showResolution', e.target.checked); }}
              />
              <FormControlLabel
                control={(<Checkbox color="primary" />)}
                label="Show full data"
                checked={options.showFull}
                onChange={(e) => { setOption('showFull', e.target.checked); }}
              />
            </FormGroup>
          </div>
          <Divider />
          <div className={classes.optionsForm}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="age-native-simple">Colormap</InputLabel>
              <Select
                native
                value={options.currentCmap}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  window.twoDImageView.setColormap(val);
                  setOption('currentCmap', val);
                }}
                inputProps={{
                  name: 'Colormap',
                  id: 'cmap',
                }}
              >
                {Object.keys(options.availableCmaps).map(cmapName => (
                  (<option value={options.availableCmaps[cmapName]}>{cmapName}</option>)
                ))
                }
              </Select>
            </FormControl>
          </div>
          <div className={classes.optionsForm} style={{ height: '30em' }}>
            <Typography id="range-slider" gutterBottom>
              Value range
            </Typography>
            <Slider
              orientation="vertical"
              value={options.valueRange}
              min={options.valueRangeLimit[0]}
              max={options.valueRangeLimit[1]}
              marks={[
                {
                  value: options.valueRangeLimit[0],
                  label: `min ${options.valueRangeLimit[0]}`,
                },
                {
                  value: options.valueRangeLimit[2],
                  label: `mean ${options.valueRangeLimit[2]}`,
                },
                {
                  value: options.valueRangeLimit[1],
                  label: `max ${options.valueRangeLimit[1]}`,
                },
              ]}
              step={1}
              onChange={(e, value) => {
                window.twoDImageView.setValueRange(value[0], value[1]);
                setOption('valueRange', value);
              }}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
            />
          </div>
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
