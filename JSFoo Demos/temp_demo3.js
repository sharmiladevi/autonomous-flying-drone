var arDrone = require('ar-drone');
var cv = require('opencv');
var http = require('http');
var fs = require('fs');
var client = arDrone.createClient();
var autonomy = require('ardrone-autonomy');
var ctrl    = new autonomy.Controller(client, {debug: false});
var pngStream = client.getPngStream();
var express = require('express');
var app = express();
var path = require('path');

var processingImage = false;
var lastPng;
var navData;
var flying = false;
var imageCount = 0;

client.config('video:video_channel', 0);
app.use(express.static(__dirname + '/views'));
var imageStream;
pngStream.on('data', function(imageData){
	imageStream = imageData;
});

pngStream
	.on('error', console.log)
	.on('data', function(pngBuffer) {
		lastPng = pngBuffer;
	});
var detectFaces = function(){
	if( ! flying ) return;
	if( ( ! processingImage ) && lastPng )
	{
		console.log("tracking started;");
		processingImage = true;
		cv.readImage( lastPng, function(err, im) {
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
				var face;
				var biggestFace;
				for(var k = 0; k < faces.length; k++) {

					//below two lines for saving rounded faces.
					var x = faces[k]
		      		im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);

					face = faces[k];
					if( !biggestFace || biggestFace.width < face.width ) biggestFace = face;
				}
				imageCount = imageCount + 1;
				im.save('./images/roundesImage_' + imageCount + '.jpg');

				if( biggestFace ){
					face = biggestFace;
					face.centerX = face.x + face.width * 0.5;
					face.centerY = face.y + face.height * 0.5;
					var centerX = im.width() * 0.5;
					var centerY = im.height() * 0.5;
					var heightAmount = -( face.centerY - centerY ) / centerY;
					var turnAmount = -( face.centerX - centerX ) / centerX;
					if( Math.abs( turnAmount ) > Math.abs( heightAmount ) ){
						console.log("turnAmount1 " + turnAmount + "   degree " + Math.abs( turnAmount )*360 + " image count " + imageCount);

						if( turnAmount < 0 ) {
							ctrl.cw(10);
						}
						else if(turnAmount > 0) {
							ctrl.ccw(10);
						}
					}
					else {
						console.log( "going vertical "+heightAmount );
						if( heightAmount < 0 )
							ctrl.down( 0.25 );
						else if(heightAmount > 0)
							ctrl.up( 0.25 );
					}
				}
				processingImage = false;
			});
		});
	};
};

app.get('/faceTrack', function (req, res) {
	res.sendfile('views/faceTrack.html');
	var faceInterval = setInterval( detectFaces, 1000);
	client.takeoff();
	client.after(6000, function(){
		ctrl.up(0.8);
	});
	client.after(13000,function(){
		console.log("stopping");
		flying = true;
	});
	client.after(90000, function() {
		flying = false;
		this.stop();
		this.land();
	});
	client.on('navdata', function(navdata) {
		navData = navdata;
	});
});

app.get('/refreshPage', function(req, res){
	var f = fs.createWriteStream('views/faceTrack.png');
	f.write(imageStream);
	f.end();
	res.send({'status':'SUCCESS'});
});

var server = app.listen(3001, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
