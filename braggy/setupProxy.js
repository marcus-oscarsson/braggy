const proxy = require('http-proxy-middleware')
 
module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://localhost:8080/',
                          logLevel: "debug",
                          pathRewrite: { "^/api/*": ""},
                          changeOrigin: true,
                          ws: true,
                          secure: false
                        }))
}
