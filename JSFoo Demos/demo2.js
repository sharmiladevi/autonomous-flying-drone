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

client.config('video:video_channel', 0);

var imageStream;
pngStream.on('data', function(imageData){
	imageStream = imageData;
});

app.get('/', function (req, res) {
	//client.takeoff();
	res.send('Hello Sharmila!');
	client.on('navdata', function(navdata){
		console.log(navdata.demo.altitudeMeters);
	});
	client
	 	.after(5000, function() {
	    	//this.stop();
	    	//this.land();
	  	});
});
app.get('/image', function (req, res) {
	console.log("sharmila");
	client.takeoff();
	client.after(6000, function(){
		ctrl.up(0.8);
		client.after(6000, function(){
			cv.readImage(imageStream, function(err, im){
			  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
			  	console.log("faces " +faces);
			    for (var i=0;i<faces.length; i++){
			      var x = faces[i]
			      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
			      console.log("sharmila1");
			    }
			    im.save('./detectedFace.jpg');
			  });
			});
	 		client
	 			.after(1000, function() {
	 			console.log("landing down");
				res.send(imageStream);
		    	this.stop();
		    	this.land();
		 	});
	 	});
	});
});

app.get('/getImage', function (req, res) {
	res.sendfile('views/index.html');
})

app.get('/video', function (req, res) {
	s.on('data', function(matrix){
		console.log(matrix);
	});
	client.createPngStream().pipe(s);
});



var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});