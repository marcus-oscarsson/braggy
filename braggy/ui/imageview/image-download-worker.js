/* eslint-disable */

// Post data to parent thread
this.postMessage({ foo: 'foo' });

// Respond to message from parent thread
this.addEventListener('message', (event) => console.log(event));
