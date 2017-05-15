var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();

mission.log('logs.txt');
mission.takeoff()
       .zero()      // Sets the current state as the reference
       .hover(1000)
       .cw(45)
       .hover(1000)  // Hover in place for 1 second
       .cw(45)
       .land();


mission.run(function (err, result) {
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log("Mission success!");
        process.exit(0);
    }
});