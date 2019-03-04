/* eslint-disable */
import axios from 'axios';

// Post data to parent thread
self.postMessage({ foo: 'foo' });

// Respond to message from parent thread
self.addEventListener('message', (event) => {
  const path = event.data.path;

  if(path !== undefined) {
    axios.post('/api/imageview/raw', { path }, { responseType: 'blob' })
      .then((response) => {
        let data = null;

        const fileReader = new FileReader();
      
        fileReader.onload = (event) => {
          data = new Int32Array(event.target.result);

          // const rgbdata = new Uint8ClampedArray(data.length * 4);

          // for (let idx=0; idx < data.length; idx++) {
          //    const red   = (data[idx] & 0x00ff0000) >> 16;
          //    const green = (data[idx] & 0x0000ff00) >> 8;
          //    const blue  = (data[idx] & 0x000000ff);
          //    const alpha = 1;
          //    rgbdata[idx] = red;
          //    rgbdata[idx + 1] = green;
          //    rgbdata[idx + 2] = blue;
          //    rgbdata[idx + 4] = 255;
          // }

          // const bmap = createImageBitmap(new ImageData(rgbdata, data.length));

          // console.log(bmap);

          self.postMessage({ path, data });
          return true;
        };

        fileReader.readAsArrayBuffer(response.data);
      })
      .catch((error) => {
        throw (error);
      });
  }
});

