import React from 'react';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import FolderIcon from '@material-ui/icons/Folder';
import ImageIcon from '@material-ui/icons/Image';
import CircularProgress from '@material-ui/core/CircularProgress';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


import * as FileBrowserAPI from './file-browser-api';

const mm = require('micromatch');

const styles = theme => ({
  scrollContainer: {
    overflow: 'auto'
  },
  input: {
    marginLeft: '1px',
    marginBottom: theme.spacing.unit * 2
  },
  fileNavContainer: {
    textAlign: 'center'
  },
  progress: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
    top: '50%',
    bottom: '50%'
  },
  downloadedItem: {
    color: '#307fd6'
  },
  item: {
  }
});


function filter(s, term) {
  let res = true;

  if (term) {
    res = mm.isMatch(s, `${term}*`);
  }

  return res;
}

class FileBrowser extends React.Component {
  state = {
    filterTerm: ''
  };

  constructor(props) {
    super(props);
    this.listItemOnClick = this.listItemOnClick.bind(this);
    this.filterInputOnChange = this.filterInputOnChange.bind(this);
  }

  listItemOnClick(fileData) {
    const { listDirRequest, onFileClick, selectFile } = this.props;

    if (fileData.isLeaf) {
      selectFile(fileData.fpath);
      onFileClick(fileData.fpath);
    } else {
      listDirRequest(fileData.fpath);
    }
  }

  showFiles() {
    const {
      files,
      selectedFile,
      currentRange,
      downloadedFiles,
      classes
    } = this.props;
    const { filterTerm } = this.state;

    return files
      .filter(file => filter(file.text, filterTerm))
      .slice(currentRange[0], currentRange[1])
      .map(file => (
        <ListItem
          button
          key={file.text}
          selected={file.fpath === selectedFile}
          onClick={() => this.listItemOnClick(file)}
        >
          <ListItemIcon
            className={file.fpath in downloadedFiles ? classes.downloadedItem : classes.item}
          >
            {file.isLeaf ? <ImageIcon /> : <FolderIcon />}
          </ListItemIcon>
          <ListItemText primary={file.text} />
        </ListItem>));
  }

  busyIndicator() {
    const { classes } = this.props;

    return (<CircularProgress disableShrink className={classes.progress} />);
  }

  filterInputOnChange(e) {
    this.setState({ filterTerm: e.target.value });
  }

  fileNavigation() {
    const {
      files,
      pageSize,
      currentRange,
      setRange,
      classes
    } = this.props;

    let incEnabled = true;
    let decEnabled = true;

    if (files.length > pageSize && currentRange[0] === 0) {
      decEnabled = false;
    } else if (files.length > pageSize && currentRange[1] > files.length) {
      incEnabled = false;
    } else if (files.length < pageSize) {
      decEnabled = false;
      incEnabled = false;
    }

    return (
      <div className={classes.fileNavContainer}>
        <Button size="small" disabled={!decEnabled} className={classes.margin} onClick={() => setRange('dec')}>
          PREV
        </Button>
        <Button size="small" disabled={!incEnabled} className={classes.margin} onClick={() => setRange('inc')}>
          NEXT
        </Button>
      </div>);
  }

  render() {
    const { classes, loading } = this.props;

    return (
      <div>
        <List>
          <ListSubheader component="div" style={{ background: '#FFF' }}>
            <div>
              <Input
                placeholder="Search"
                className={classes.input}
                inputProps={{ 'aria-label': 'Filter' }}
                onChange={this.filterInputOnChange}
              />
            </div>
          </ListSubheader>
          <div className={classes.scrollContainer}>
            { loading ? this.busyIndicator() : this.showFiles()}
          </div>
        </List>
        { this.fileNavigation() }
      </div>
    );
  }
}


function mapStateToProps({ fileBrowser }) {
  return {
    files: fileBrowser.files,
    loading: fileBrowser.loading,
    selectedFile: fileBrowser.selectedFile,
    currentRange: fileBrowser.currentRange,
    pageSize: fileBrowser.pageSize
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(FileBrowserAPI, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(FileBrowser)
);
