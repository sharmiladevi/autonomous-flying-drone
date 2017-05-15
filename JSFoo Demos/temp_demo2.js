var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');
var client  = arDrone.createClient();
var pngStream = client.getPngStream();
var express = require('express');
var app = express();
var path = require('path');
var cv = require('opencv');
var s = new cv.ImageStream();
var ctrl = new autonomy.Controller(client, {debug: false});

console.log('__dirname ' + __dirname);

client.config('video:video_channel', 0);
app.use(express.static(__dirname + '/views'));

var imageStream;
pngStream.on('data', function(imageData){
	imageStream = imageData;
});

app.get('/getFace', function (req, res) {
	console.log("sharmila");
	res.sendfile('views/index.html');
	client.takeoff();
	client.after(6000, function(){
		ctrl.up(0.8);
		client.after(6000, function(){
			cv.readImage(imageStream, function(err, im){
			  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
			  	console.log("faces " +faces);
			  	if(faces && faces.length > 0){
				    for (var i=0;i<faces.length; i++){
				      var x = faces[i]
				      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
				      console.log("sharmila1");
				    }
				    im.save('views/detectedFace.jpg');
				}
				else
			  		im.save('views/detectedFace.jpg');
			  });
			});
	 		client
	 			.after(1000, function() {
	 			console.log("landing down");
		    	this.land();
		 	});
	 	});
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});