var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', 3000);
app.listen(process.env.PORT || app.get('port'));