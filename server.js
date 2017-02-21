/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const port = 3000;
const app = express();

  app.use(express.static(__dirname ));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

app.listen(port, '192.168.1.13', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://192.168.1.13:%s/ in your browser.', port, port);
});
