/* eslint-disable */
import axios from 'axios';
// Respond to message from parent thread
self.addEventListener('message', (event) => {
  const path = event.data.path;

  if(path !== undefined) {
    axios.post('/api/imageview/raw-full', { path }, { responseType: 'arraybuffer' })
      .then((response) => {
        let data = null;

        data = new Int32Array(response.data);
        const rgbdata = new Uint8Array(data.length * 4);

        for (let idx=0; idx < data.length; idx++) {
          let red   = 0;
          let green = 0;
          let blue  = 0;
          let alpha = 255;

          if (data[idx] < 0) {
            red   = 255;
            green = 0;
            blue  = 0;
            alpha = 255;

          } else {
            red   = (data[idx] & 0x00ff0000) >> 16;
            green = (data[idx] & 0x0000ff00) >> 8;
            blue  = (data[idx] & 0x000000ff);
            alpha = 255;
          }

          const k = idx*4;

          rgbdata[k] = red;
          rgbdata[k + 1] = green;
          rgbdata[k + 2] = blue;
          rgbdata[k + 3] = alpha;
        }

        self.postMessage({ path, data, rgbdata });

        return true;
      })
      .catch((error) => {
        throw (error);
      });
  }
});

