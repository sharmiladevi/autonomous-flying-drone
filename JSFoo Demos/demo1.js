var arDrone = require('ar-drone');
var autonomy = require('ardrone-autonomy');
var client  = arDrone.createClient();
var ctrl    = new autonomy.Controller(client, {debug: false});
var repl    = client.createRepl();

repl._repl.context['ctrl'] = ctrl;