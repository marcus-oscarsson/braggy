import * as THREE from 'three-full';
import Stats from 'stats.js';
import * as d3 from 'd3';

/* eslint-disable */
export const TemperatureShader = {
  uniforms: {
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
       'vUv = uv;',
       'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D data;',
    'uniform float cmap_min;',
    'uniform float cmap_max;',
    'varying vec2 vUv;',

    'vec4 cmapTemperature(float normValue) {',
        'float red = clamp(4. * normValue - 2., 0., 1.);',
        'float green = 1. - clamp(4. * abs(normValue - 0.5) - 1., 0., 1.);',
        'float blue = 1. - clamp(4. * normValue - 1., 0., 1.);',
        'return vec4(red, green, blue, 1.);',
    '}',

    'void main() {',
        'vec4 color = texture2D(data, vUv);',
        'vec3 c = color.rgb;',
    '    gl_FragColor = cmapTemperature((c.r - cmap_min)/(cmap_max - cmap_min));',
    '}'
  ].join('\n')
};

export const GreyShader = {
  uniforms: {
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D data;',
    'varying vec2 vUv;',
    'uniform float cmap_min;',
    'uniform float cmap_max;',

    'float normValue(float val) {',
       'float normValue = clamp((val - cmap_min)/(cmap_max - cmap_min), 0.0, 1.0);',
       'return normValue;',
    '}',
 
    'void main() {',
        'vec4 color = texture2D(data, vUv);',
        'vec3 c = color.rgb;',
        'c.r = (1.0 - ( 0.299 * normValue(color.r) + 0.587 * normValue(color.g) + 0.114 * normValue(color.b)));',
        'c.g = (1.0 - ( 0.299 * normValue(color.r) + 0.587 * normValue(color.g)  + 0.114 * normValue(color.b)));',
        'c.b = (1.0 - ( 0.299 * normValue(color.r) + 0.587 * normValue(color.g) + 0.114 * normValue(color.b)));',
        'gl_FragColor = vec4(c.rgb, color.a);',
    '}'
  ].join('\n')
};

export const StdShader = {
  uniforms: {
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
       'vUv = uv;',
       'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D data;',
    'varying vec2 vUv;',
    'uniform float cmap_min;',
    'uniform float cmap_max;',

    'float normValue(float val) {',
        'float normValue = clamp((val - cmap_min)/(cmap_max - cmap_min), 0.0, 1.0);',
        'return normValue;',
    '}',

    'void main() {',
        'vec4 color = texture2D(data, vUv);',
        'vec3 c = color.rgb;',
        'c.r = normValue(color.r);',
        'c.g = normValue(color.g);',
        'c.b = normValue(color.b);',
        'gl_FragColor = vec4(c.rgb, color.a);',
    '}'
  ].join('\n')
};

export const SepiaShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 1.0 },
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform float amount;',
    'uniform sampler2D data;',
    'uniform float cmap_min;',
    'uniform float cmap_max;',
    'varying vec2 vUv;',

    'void main() {',
        'vec4 color = texture2D(data, vUv);',
        'vec3 c = color.rgb;',
        'color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );',
        'color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );',
        'color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );',
        'gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );',
    '}'
  ].join('\n')
};

/* eslint-enable */

class InfoDiv {
  constructor(className) {
    this.dom = document.createElement('div');

    Object.assign(this.dom.style, {
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '0.5em',
      'border-radius': '4px',
      color: 'rgba(255, 255, 255, 1)',
      display: 'none',
      'user-select': 'none',
      'pointer-events': 'none'
    });

    this.dom.className = className;
  }

  show = () => {
    this.dom.style.display = 'block';
  }

  hide = () => {
    this.dom.style.display = 'none';
  }

  setPosition = (x, y) => {
    this.dom.style.left = `${x}px`;
    this.dom.style.top = `${y}px`;
  }
}

function resolutionAt(x, y, dd, wavelength) {
  const dhalf = Math.sqrt(x * x + y * y) * Math.PI;
  return wavelength / (2 * Math.sin(0.5 * Math.atan(dhalf / dd)));
}

export default class TwoDImageView {
  constructor(container) {
    this.container = container;
    this.mouseOverInfoDiv = new InfoDiv('imgeview-info-div');
    this.container.appendChild(this.mouseOverInfoDiv.dom);
    this.cmap_min = 0.0;
    this.cmap_max = 1.0;
    this.cmap = StdShader;

    this.rawData = null;
    this.data = null;
    this.imageWidth = null;
    this.imageHeight = null;
    this.imageHDR = {
      beamCX: 0,
      beamCY: 0,
      pxpmmX: 0,
      pxpmmY: 0,
      detectorDistance: 0,
      wavelength: 0
    };

    this.width = null;
    this.height = null;
    this.currentScale = null;

    this.stats = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.d3view = null;
    this.d3Container = null;

    this.init();
  }

  setRawData = (d) => {
    this.rawData = d;
  }

  setImageHdr = (beamCX, beamCY, pxppmX, pxppmY,
    detectorDistance, wavelength) => {
    this.imageHDR.beamCX = beamCX;
    this.imageHDR.beamCY = beamCY;
    this.imageHDR.pxpmmX = pxppmX;
    this.imageHDR.pxpmmY = pxppmY;
    this.imageHDR.detectorDistance = detectorDistance;
    this.imageHDR.wavelength = wavelength;
  }

  init = () => {
    this.initD3();
    this.initThree(this.container.clientWidth, this.container.clientHeight);
    this.initPanAndZoom();

    this.renderer.domElement.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
  }

  initD3 = () => {
    this.d3Container = d3.select(this.container)
      .append('svg')
      .attr('width', this.container.clientWidth)
      .attr('height', this.container.clientHeight)
      .attr('style', 'position: absolute; pointer-events: none;');

    // this.d3Container.append('circle')
    //   .attr('cx', this.container.clientWidth / 2)
    //   .attr('cy', this.container.clientHeight / 2)
    //   .attr('r', 20);
  }

  initThree = (width, height) => {
    // Three JS canvas
    this.renderer = new THREE.WebGLRenderer();
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Add stats box
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.bottom = '0px';
    this.stats.dom.style.right = '0px';
    this.stats.dom.style.left = null;
    this.stats.dom.style.top = null;

    this.container.appendChild(this.stats.dom);

    // Set up camera and scene
    this.camera = new THREE.OrthographicCamera(
      0,
      width,
      height,
      0,
      0,
      1000
    );

    this.camera.position.set(0, 0, 100);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.animateThree();
  }

  initPanAndZoom = () => {
    this.d3zoom = d3.zoom()
      .scaleExtent([0, 10000])
      .on('zoom', () => {
        const { event } = d3;
        if (event.sourceEvent) {
          const newZ = event.transform.k;

          if (newZ !== this.camera.zoom) {
            this.camera.zoom = newZ;
            this.camera.updateProjectionMatrix();
          } else {
            const { movementX, movementY } = event.sourceEvent;

            this.camera.position.set(
              this.camera.position.x - movementX,
              this.camera.position.y + movementY,
              this.camera.position.z
            );
          }

          this.camera.needsUpdate = true;
        }
      });

    // Add zoom listener
    this.d3view = d3.select(this.renderer.domElement);
    this.d3view.call(this.d3zoom);
  }

  handleMouseMove = (e) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, this.camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      /* eslint no-bitwise:0 */
      /* eslint no-mixed-operators:0 */
      const obj = intersects[0];

      const imageX = Math.floor(obj.uv.x * this.imageWidth);
      const imageY = Math.floor((1 - obj.uv.y) * this.imageHeight);
      const i = (imageY * this.imageWidth + imageX);
      const intensity = this.rawData[i];

      const cx = ((this.imageWidth / 2 + this.imageHDR.beamCX) - imageX) / this.imageHDR.pxpmmX;
      const cy = ((this.imageHeight / 2 + this.imageHDR.beamCY) - imageY) / this.imageHDR.pxpmmY;
      const res = resolutionAt(
        cx,
        cy,
        this.imageHDR.detectorDistance,
        this.imageHDR.wavelength
      ).toFixed(2);

      this.mouseOverInfoDiv.dom.innerHTML = `X:${imageX} Y:${imageY} <br /> Intensity: ${intensity} <br /> Resolution ${res}`;
      this.mouseOverInfoDiv.show();
      this.mouseOverInfoDiv.setPosition(x, y);
    }
  }

  scale = (s) => {
    this.d3zoom.scaleTo(this.d3view, s);
    this.camera.zoom = s;
    this.camera.updateProjectionMatrix();
  }

  animateThree = () => {
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
    window.requestAnimationFrame(this.animateThree);
  }

  clearThree(obj) {
    while (obj.children.length > 0) {
      this.clearThree(obj.children[0]);
      obj.remove(obj.children[0]);
    }

    if (obj.geometry) {
      obj.geometry.dispose();
    }

    if (obj.material) {
      obj.material.dispose();
    }

    if (obj.mesh) {
      obj.mesh.dispose();
    }

    if (obj.texture) {
      obj.texture.dispose();
    }
  }

  createUVMapping = (geometry) => {
    /* eslint no-param-reassign: ["error", { "props": false }] */

    geometry.computeBoundingBox();

    const { max } = geometry.boundingBox;
    const { min } = geometry.boundingBox;

    const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    const range = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    const { faces } = geometry;

    for (let i = 0; i < geometry.faces.length; i += 1) {
      const v1 = geometry.vertices[faces[i].a];
      const v2 = geometry.vertices[faces[i].b];
      const v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
        new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
        new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
      ]);
    }

    geometry.uvsNeedUpdate = true;
  }

  renderImageData = (data, width, height) => {
    // Clear already existing scene
    this.data = data;
    this.imageWidth = width;
    this.imageHeight = height;
    this.clearThree(this.scene);
    this.scene.dispose();

    const rectShape = new THREE.Shape();
    rectShape.moveTo(0, 0);
    rectShape.lineTo(0, height);
    rectShape.lineTo(width, height);
    rectShape.lineTo(width, 0);
    rectShape.lineTo(0, 0);

    this.geometry = new THREE.ShapeGeometry(rectShape);
    this.createUVMapping(this.geometry);

    this.dataTexture = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping
    );

    this.dataTexture.flipY = true;
    this.dataTexture.needsUpdate = true;

    this.dataTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.dataTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.dataTexture.magFilter = THREE.NearestFilter;
    this.dataTexture.minFilter = THREE.LinearFilter;

    this.dataMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        cmap_min: { value: 0.0 },
        cmap_max: { value: 1.0 },
        data: { value: this.dataTexture },
      },
      vertexShader: this.cmap.vertexShader,
      fragmentShader: this.cmap.fragmentShader
    });

    this.dataMaterial.needsUpdate = true;

    this.mesh = new THREE.Mesh(this.geometry, this.dataMaterial);
    this.mesh.geometry.center();
    this.scale(this.container.clientHeight / height);

    this.mesh.position.x = this.container.clientWidth / 2;
    this.mesh.position.y = this.container.clientHeight / 2;
    this.mesh.needsUpdate = true;

    this.scene.add(this.mesh);
    this.scene.needsUpdate = true;
  }

  render = (rgbBuffer, rawDataBuffer, imgHeader) => {
    this.setRawData(rawDataBuffer);

    this.setImageHdr(
      imgHeader.beam_ocx,
      imgHeader.beam_ocy,
      imgHeader.pxxpm,
      imgHeader.pxypm,
      imgHeader.detector_distance,
      imgHeader.wavelength
    );

    this.renderImageData(
      rgbBuffer,
      imgHeader.img_width,
      imgHeader.img_height
    );
  }
}
