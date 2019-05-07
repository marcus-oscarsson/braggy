/* eslint-disable */
import axios from 'axios';
// Respond to message from parent thread
self.addEventListener('message', (event) => {
  const path = event.data.path;

  if(path !== undefined) {
    axios.post('/api/imageview/raw-full', { path }, { responseType: 'blob' })
      .then((response) => {
        let data = null;

        const fileReader = new FileReader();
      
        fileReader.onload = (event) => {
          data = new Int32Array(event.target.result);
          const rgbdata = new Uint8Array(data.length * 4);

          for (let idx=0; idx < data.length; idx++) {
             const red   = (data[idx] & 0x00ff0000) >> 16;
             const green = (data[idx] & 0x0000ff00) >> 8;
             const blue  = (data[idx] & 0x000000ff);
             const alpha = 255;
             const k = idx*4;
             rgbdata[k] = red;
             rgbdata[k + 1] = green;
             rgbdata[k + 2] = blue;
             rgbdata[k + 3] = alpha;
          }          

          self.postMessage({ path, data, rgbdata });
          return true;
        };

        fileReader.readAsArrayBuffer(response.data);
      })
      .catch((error) => {
        throw (error);
      });
  }
});

