import * as THREE from 'three-full';
import Stats from 'stats.js';
import * as d3 from 'd3';

/* eslint-disable */
export const StdShader = {
  cmaps: {
    'viridis': 0,
    'plasma': 1,
    'magma': 2,
    'inferno': 3,
    'temperature': 4,
    'grey': 5,
    'greywithred': 6,
  },
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
    'uniform int cmap;',

    'float normValue(float val) {',
        'float normValue = clamp((val - cmap_min)/(cmap_max - cmap_min), 0.0, 1.0);',
        'return normValue;',
    '}',

    'vec3 viridis(float t) {',
        'const vec3 c0 = vec3(0.2777273272234177, 0.005407344544966578, 0.3340998053353061);',
        'const vec3 c1 = vec3(0.1050930431085774, 1.404613529898575, 1.384590162594685);',
        'const vec3 c2 = vec3(-0.3308618287255563, 0.214847559468213, 0.09509516302823659);',
        'const vec3 c3 = vec3(-4.634230498983486, -5.799100973351585, -19.33244095627987);',
        'const vec3 c4 = vec3(6.228269936347081, 14.17993336680509, 56.69055260068105);',
        'const vec3 c5 = vec3(4.776384997670288, -13.74514537774601, -65.35303263337234);',
        'const vec3 c6 = vec3(-5.435455855934631, 4.645852612178535, 26.3124352495832);',
        'return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));',
    '}',

    'vec3 plasma(float t) {',

      'const vec3 c0 = vec3(0.05873234392399702, 0.02333670892565664, 0.5433401826748754);',
      'const vec3 c1 = vec3(2.176514634195958, 0.2383834171260182, 0.7539604599784036);',
      'const vec3 c2 = vec3(-2.689460476458034, -7.455851135738909, 3.110799939717086);',
      'const vec3 c3 = vec3(6.130348345893603, 42.3461881477227, -28.51885465332158);',
      'const vec3 c4 = vec3(-11.10743619062271, -82.66631109428045, 60.13984767418263);',
      'const vec3 c5 = vec3(10.02306557647065, 71.41361770095349, -54.07218655560067);',
      'const vec3 c6 = vec3(-3.658713842777788, -22.93153465461149, 18.19190778539828);',
  
      'return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));',
    '}',

    'vec3 magma(float t) {',
  
      'const vec3 c0 = vec3(-0.002136485053939582, -0.000749655052795221, -0.005386127855323933);',
      'const vec3 c1 = vec3(0.2516605407371642, 0.6775232436837668, 2.494026599312351);',
      'const vec3 c2 = vec3(8.353717279216625, -3.577719514958484, 0.3144679030132573);',
      'const vec3 c3 = vec3(-27.66873308576866, 14.26473078096533, -13.64921318813922);',
      'const vec3 c4 = vec3(52.17613981234068, -27.94360607168351, 12.94416944238394);',
      'const vec3 c5 = vec3(-50.76852536473588, 29.04658282127291, 4.23415299384598);',
      'const vec3 c6 = vec3(18.65570506591883, -11.48977351997711, -5.601961508734096);',
  
      'return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));',
    '}',
  
    'vec3 inferno(float t) {',

      'const vec3 c0 = vec3(0.0002189403691192265, 0.001651004631001012, -0.01948089843709184);',
      'const vec3 c1 = vec3(0.1065134194856116, 0.5639564367884091, 3.932712388889277);',
      'const vec3 c2 = vec3(11.60249308247187, -3.972853965665698, -15.9423941062914);',
      'const vec3 c3 = vec3(-41.70399613139459, 17.43639888205313, 44.35414519872813);',
      'const vec3 c4 = vec3(77.162935699427, -33.40235894210092, -81.80730925738993);',
      'const vec3 c5 = vec3(-71.31942824499214, 32.62606426397723, 73.20951985803202);',
      'const vec3 c6 = vec3(25.13112622477341, -12.24266895238567, -23.07032500287172);',
  
      'return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));',
    '}',

    'vec3 temperature(float t) {',
        'float red = clamp(4. * t - 2., 0., 1.);',
        'float green = 1. - clamp(4. * abs(t - 0.5) - 1., 0., 1.);',
        'float blue = 1. - clamp(4. * t - 1., 0., 1.);',
        'return vec3(red, green, blue);',
    '}',

    'vec3 grey(float t) {',
        'float red = (1.0 - t);',
        'float green = (1.0 - t);',
        'float blue = (1.0 - t);',
        'return vec3(red, green, blue);',
    '}',

    'vec3 greywithred(float t) {',
        'float red;',
        'float green;',
        'float blue;',
        'float normT = normValue(t);',

        'if (t < 0.0) {',
            'red = 1.0;',
            'green = normT;',
            'blue = normT;',
        '} else {',
            'red = (1.0 - normT);',
            'green = (1.0 - normT);',
            'blue = (1.0 - normT);',
        '}',

        'return vec3(red, green, blue);',
    '}',

    'void main() {',
        'vec4 color = texture2D(data, vUv);',
        'vec4 c;',
        'if (cmap == 0) {',
            'c = vec4(viridis(normValue(color.r)).rgb, color.a);',
        '} else if (cmap == 1) {',
            'c = vec4(plasma(normValue(color.r)).rgb, color.a);',
        '} else if (cmap == 2) {',
            'c = vec4(magma(normValue(color.r)).rgb, color.a);',
        '} else if (cmap == 3) {',
            'c = vec4(inferno(normValue(color.r)).rgb, color.a);',
        '} else if (cmap == 4) {',
            'c = vec4(temperature(normValue(color.r)).rgb, color.a);',
        '} else if (cmap == 5) {',
            'c = vec4(grey(normValue(color.r)).rgb, color.a);',
        '} else if (cmap == 6) {',
            'c = vec4(greywithred(color.r).rgb, color.a);',
        '} else  {',
            'c = vec4(viridis(normValue(color.r)).rgb, color.a);',
        '}',
        'gl_FragColor = c;',
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
    this.cmap = StdShader;
    this.cmap_min = 0;
    this.cmap_max = 1;
    this.cmap = 0;

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

  setValueRange = (min, max) => {
    this.cmap_min = min;
    this.cmap_max = max;

    if (this.dataMaterial) {
      this.dataMaterial.uniforms.cmap_min.value = min;
      this.dataMaterial.uniforms.cmap_max.value = max;
      this.dataMaterial.needsUpdate = true;
      this.scene.needsUpdate = true;
      this.render.needsUpdate = true;
    }
  }

  setColormap = (cmap) => {
    this.cmap = cmap;

    if (this.dataMaterial) {
      this.dataMaterial.uniforms.cmap.value = cmap;
      this.dataMaterial.needsUpdate = true;
      this.scene.needsUpdate = true;
      this.render.needsUpdate = true;
    }
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

  renderImageData = (data, width, height, dtype = 'float32') => {
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

    let threeDtype = THREE.UnsignedByteType;
    let threeFormat = THREE.RGBAFormat;
    let shader = this.cmap;

    if (dtype === 'float32') {
      threeDtype = THREE.FloatType;
      threeFormat = THREE.LuminanceFormat;
      shader = StdShader;
    }

    this.dataTexture = new THREE.DataTexture(
      data,
      width,
      height,
      threeFormat,
      threeDtype,
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
        cmap: { value: this.cmap },
        cmap_min: { value: this.cmap_min },
        cmap_max: { value: this.cmap_max },
        data: { value: this.dataTexture },
      },
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
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

  render = (rawDataBuffer, imgHeader, dtype) => {
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
      rawDataBuffer,
      imgHeader.img_width,
      imgHeader.img_height,
      dtype
    );
  }
}
