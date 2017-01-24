var Twit = require('twit'),
    credentials = require('./Credentials.js'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    limit = require('simple-rate-limiter');
    
server.listen(process.env.PORT || 8080);

app.use(express.static(__dirname + '/front_end'));


io.sockets.on('connect', function(socket) {
    console.log('connected')
    socket.emit('connected');


    socket.on('start tweets', function(search) {
        console.log(search);
        
        var T = new Twit(credentials);

        var world = '-180,-90,180,90';

        var options = {
            locations: world,
            filter_level: 'none'
        }

        var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]
        if(search == '') {
            options.locations = world
        }

       if(search != '') {
            delete options.locations;
            options.track = search;
        }

        var stream = T.stream('statuses/filter', options);
       console.log(options);

        var tick = function(tweet) {
            streamTweets({text:tweet.text, name:tweet.user.name, username:tweet.user.screen_name, icon:tweet.user.profile_image_url});
            if(tweet.coordinates) {
                if (tweet.coordinates != null) {
                    var locationObj = {
                        text:tweet.text, 
                        name:tweet.user.name, 
                        username:tweet.user.screen_name, 
                        icon:tweet.user.profile_image_url,
                        lat: tweet.coordinates.coordinates[0],
                        lng: tweet.coordinates.coordinates[1],
                        text: tweet.text
                    }
                    socket.emit('location-stream', locationObj);
                }
            }
        }

        stream.on('tweet', function (tweet) {            
            tick(tweet);
        });

    });
    let streamTweets = limit(function(options) {
        socket.emit('stream', options);
    }).to(1).per(2000);
});





  









