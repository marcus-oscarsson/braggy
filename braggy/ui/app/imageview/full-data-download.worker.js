/* eslint-disable */
import axios from 'axios';
// Respond to message from parent thread
self.addEventListener('message', (event) => {
  const path = event.data.path;
  
  if(path !== undefined) {
    axios.post('/api/imageview/raw-full', { path }, { responseType: 'arraybuffer' })
      .then((response) => {
        const data = new Float32Array(response.data);
        self.postMessage({ path, data });

        return true;
      })
      .catch((error) => {
        throw (error);
      });
  }
});

