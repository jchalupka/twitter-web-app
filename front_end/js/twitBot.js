var geocoder = new google.maps.Geocoder();

function initialize() {
    var socket = io.connect('/');
    var myLatlng = null;

    var light_grey_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];
    var myOptions = {
        zoom: 3,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    };

    document.getElementById('search_button').addEventListener('click', function() {
        socket.emit('start tweets', $('#search_phrase').val());
    })
    
    var map = new google.maps.Map(document.getElementById('map_canvas'), myOptions, function(status) {
        if (status !== 'OK') {
            console.log("Something went wrong");
        }

    });

    geocoder.geocode({address: "London Ontario"}, function(results, status) {
        if (status !== 'OK') {
            alert('Geocode was not successful for the following reason: ' + status);
        } else {
            map.setCenter(results[0].geometry.location);
        }
    });

    // socket.emit('start tweets', $('#search_phrase').val())

    socket.on('location-stream', function(tweet) {
        var tweetLocation = new google.maps.LatLng(tweet.lng, tweet.lat);
        var marker = new google.maps.Marker({
            position: tweetLocation,
            map: map
        });

        var infowindow = new google.maps.InfoWindow({
            
            content: '<div><li class=listItem><img src="'+ tweet.icon +'" alt=""><div class="name">'+tweet.name+' (@'+tweet.username+')</div><div class="message">' + tweet.text + '</div></li></div>'
        })

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
    });


    function showTweetTick (tweet) {
        $(".content").prepend('<li class=listItem><img src="'+ tweet.icon +'" alt=""><div class="name">'+tweet.name+' (@'+tweet.username+')</div><div class="message">' + tweet.text + '</div></li>');

    }

    socket.on('stream', function(tweet) {
        showTweetTick(tweet);
    });

    
}


function getMap() {
    console.log(document.getElementById('map_canvas'))
}