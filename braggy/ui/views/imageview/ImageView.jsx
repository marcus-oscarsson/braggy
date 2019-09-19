import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import TwoDImageView from './TwoDImageView';

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
    this.canvasContainerRef = React.createRef();
  }

  componentDidMount() {
    window.twoDImageView = new TwoDImageView(this.canvasContainerRef.current);
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div
          id="imageview-container"
          ref={this.canvasContainerRef}
          className={classes.imageViewContainer}
        />
      </div>
    );
  }
}


function mapStateToProps() {
  return {};
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles, { withTheme: true })(ImageView)
);
