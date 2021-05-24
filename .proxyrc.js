const serveStatic = require('serve-static')
const path = require('path')

module.exports = function (app) {
  // Use static middleware

  console.log('setting up /assets');
  app.use('/assets',serveStatic('assets'));
}