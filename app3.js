var express = require('express');
var app = express();
var path = require('path');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var pngStream = client.getPngStream();
var fs = require('fs');

console.log('__dirname ' + __dirname);

app.use(express.static(__dirname + '/views'));

client.config('video:video_channel', 0);
var imageStream;
pngStream.on('data', function(imageData){
	imageStream = imageData;
});

app.get('/getImage', function (req, res) {
	res.sendfile('views/index.html');
});

app.get('/refreshPage', function(req, res){
	var f = fs.createWriteStream('views/name.png');
	f.write(imageStream);
	f.end();
	res.send({'status':'SUCCESS'});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});