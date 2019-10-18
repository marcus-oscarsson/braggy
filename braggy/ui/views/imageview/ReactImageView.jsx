import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Slider from 'rc-slider';
import NumericInput from 'react-numeric-input';
import 'rc-slider/assets/index.css';

import {
  FaRegPlusSquare,
  FaRegDotCircle,
  FaRegMinusSquare,
  FaRegSun
} from 'react-icons/fa';

import ImageView from './ImageView';

export default class ReactImageView extends React.Component {
  constructor(props) {
    super(props);
    this.imageView = new ImageView();
    this.canvasContainerRef = React.createRef();
    this.state = {
      toolboxVisible: false
    };
  }

  componentDidMount() {
    this.imageView.init(this.canvasContainerRef.current);
  }

  availableColormaps = () => {
    let cmaps = [];

    if (this.imageView) {
      cmaps = Object.keys(this.imageView.shader.cmaps);
    }

    return cmaps;
  }

  renderToolBox = () => {
    const { toolboxVisible } = this.state;
    let tbox = null;

    if (this.imageView) {
      tbox = (
        <div className={`toolbox ${toolboxVisible ? 'toolbox-visible' : ''}`}>
          <ListGroup variant="flush" className={`${toolboxVisible ? 'toolbox-visible' : ''}`}>
            <ListGroup.Item>
              <h4>
                <small className="text-muted">
                  Info
                </small>
              </h4>
              <Row>
                <Col xs="4">
                  Det. distance:
                </Col>
                <Col xs="2">
                  { this.imageView.imageHDR.detector_distance.toFixed(4) }
                </Col>
                <Col xs="4">
                 Wavelength
                </Col>
                <Col xs="2">
                  { this.imageView.imageHDR.wavelength.toFixed(4) }
                </Col>
              </Row>
              <Row>
                <Col xs="4">
                  Min:
                </Col>
                <Col xs="2">
                  { this.imageView.imageHDR.min }
                </Col>
                <Col xs="4">
                 Mean:
                </Col>
                <Col xs="2">
                  { this.imageView.imageHDR.mean.toFixed(2) }
                </Col>
              </Row>
              <Row>
                <Col xs="4">
                  Max:
                </Col>
                <Col xs="2">
                  { this.imageView.imageHDR.max }
                </Col>
                <Col xs="4">
                 Std:
                </Col>
                <Col xs="2">
                  { this.imageView.imageHDR.std.toFixed(2) }
                </Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <h4>
                <small className="text-muted">
                  Options
                </small>
              </h4>
              <Form.Group>
                <Form.Check
                  checked={this.imageView.renderRings}
                  type="checkbox"
                  label="Show diffraction rings"
                  onChange={(e) => {
                    this.imageView.showDiffractionRings(e.target.checked);
                    this.forceUpdate();
                  }}
                />
              </Form.Group>
            </ListGroup.Item>
            <ListGroup.Item>
              <h4>
                <small className="text-muted">
                  Colormap
                </small>
              </h4>
              <Form>
                <Form.Group>
                  <Form.Control
                    as="select"
                    onChange={(e) => {
                      this.imageView.setColormap(e.target.selectedIndex);
                    }}
                  >
                    {this.availableColormaps().map(cmap => (<option>{cmap}</option>))}
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>
                    Value range
                  </Form.Label>
                  <Slider.Range
                    min={this.imageView.valueLimitRange[0]}
                    max={this.imageView.valueLimitRange[1]}
                    marks={{
                      [this.imageView.valueLimitRange[0]]: 'min',
                      [this.imageView.valueLimitRange[1]]: 'max'
                    }}
                    step={1}
                    value={[
                      this.imageView.cmap_min,
                      this.imageView.cmap_max]
                    }
                    onChange={(range) => {
                      this.imageView.setValueRange(range[0], range[1]);
                      this.forceUpdate();
                    }}
                  />
                </Form.Group>
                <Form.Row>
                  <Form.Group as={Col} xs="3">
                    <NumericInput
                      size={3}
                      max={this.imageView.imageHDR.max - 1}
                      min={this.imageView.imageHDR.min}
                      value={Math.floor(this.imageView.valueLimitRange[0])}
                      onChange={(v) => {
                        const value = Math.floor(parseInt(v, 10));

                        if (!Number.isNaN(value)) {
                          this.imageView.setValueLimitRange(
                            value,
                            this.imageView.valueLimitRange[1],
                          );
                          this.forceUpdate();
                        }
                      }}
                    />
                  </Form.Group>
                  <Col className="col-xs-auto text-center">
                    {`Range ${Math.floor(this.imageView.cmap_min)} - ${Math.floor(this.imageView.cmap_max)}`}
                  </Col>
                  <Form.Group as={Col} xs="3">
                    <NumericInput
                      size={3}
                      max={this.imageView.imageHDR.max}
                      min={this.imageView.imageHDR.min + 1}
                      value={Math.floor(this.imageView.valueLimitRange[1])}
                      onChange={(v) => {
                        const value = Math.floor(parseInt(v, 10));

                        if (!Number.isNaN(value)) {
                          this.imageView.setValueLimitRange(
                            this.imageView.valueLimitRange[0],
                            value
                          );
                          this.forceUpdate();
                        }
                      }}
                    />
                  </Form.Group>
                </Form.Row>
              </Form>
            </ListGroup.Item>
          </ListGroup>
        </div>
      );
    }

    return tbox;
  }

  render() {
    const { toolboxVisible } = this.state;

    return (
      <div className="imageview">
        <div
          className="toolbar"
          id="imageview-menu"
        >
          <FaRegMinusSquare
            onClick={() => {
              this.imageView.relativeScale(-0.1);
            }}
          />
          <FaRegDotCircle
            onClick={() => {
              this.imageView.resetScale();
            }}
          />
          <FaRegPlusSquare
            onClick={() => {
              this.imageView.relativeScale(0.1);
            }}
          />
          <FaRegSun
            onClick={() => {
              this.setState({ toolboxVisible: !toolboxVisible });
            }}
          />
        </div>
        {this.renderToolBox()}
        <div
          id="imageview-container"
          ref={this.canvasContainerRef}
          className="image"
        />
      </div>
    );
  }
}
