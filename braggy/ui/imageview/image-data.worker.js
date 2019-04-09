/* eslint-disable */
import axios from 'axios';
import lz4 from 'lz4js';

// Respond to message from parent thread
self.addEventListener('message', (event) => {
  const hdr = event.data.hdr;
  const path = event.data.path;
 
  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    const compressed = new Uint8Array(event.target.result);
    const data = lz4.decompress(compressed);
    const rgbdata = new Uint8Array(data.length * 4);

    for (let idx = 0; idx < data.length; idx++) {
      const red = 255 - data[idx];
      const green = 255 - data[idx];
      const blue = 255 - data[idx];
      const alpha = 255;
      const k = idx * 4;
      rgbdata[k] = red;
      rgbdata[k + 1] = green;
      rgbdata[k + 2] = blue;
      rgbdata[k + 3] = alpha;
    }

    self.postMessage({ path, hdr, data: rgbdata });
    return true;
  };

  fileReader.readAsArrayBuffer(event.data.data);
})

