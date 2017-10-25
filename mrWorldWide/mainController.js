app.controller('MainController', ['$scope', function ($scope) {
    $scope.user = {
        first: 'James',
        last: 'Farrington',
        age: 20
    };
    $scope.pins = [
    ];

    var photoIndex = 0;
    var innerPhotoIndex = 0;
    $scope.togglePhoto = function (x) {
        innerPhotoIndex += x;
        document.getElementById("caption").innerHTML = "";
        if (innerPhotoIndex >= $scope.pins[photoIndex].photos.length) {
            innerPhotoIndex = 0;
        } else if (innerPhotoIndex < 0) {
            innerPhotoIndex = $scope.pins[photoIndex].photos.length - 1;
        }
        document.getElementById("modalImage").src = $scope.pins[photoIndex].photos[innerPhotoIndex].images[0].source;
        if ($scope.pins[photoIndex].photos[innerPhotoIndex].name != null) {
            document.getElementById("caption").innerHTML = "\"" + $scope.pins[photoIndex].photos[innerPhotoIndex].name + "\"";
        }
   }



    //load modal correctly
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    $scope.setModal = function(i) {
        document.getElementById("caption").innerHTML = "";
        document.getElementById("modalLoc").innerHTML = '<i class="fa fa-map-marker" style="color:rgb(40,200,150);"></i> ' + $scope.pins[i].city + ', ' + $scope.pins[i].country;
        document.getElementById("modalDate").innerHTML = months[$scope.pins[i].date.getMonth()] + ' ' + $scope.pins[i].date.getDate() + ', ' + $scope.pins[i].date.getFullYear();
        //document.getElementById("modalText").innerHTML = $scope.pins[i].text;
        document.getElementById("modalImage").src = $scope.pins[i].icon;
        if ($scope.pins[i].photos[0].name != null) {
            document.getElementById("caption").innerHTML = "\"" + $scope.pins[i].photos[0].name + "\"";
        }
        photoIndex = i;

    }



    //setting map up properly
    var map;

    $scope.initMap = function (pins) {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 20, lng: 0 },
            zoom: 3,
            maxZoom: 8,
            minZoom: 2,
            mapTypeId: 'roadmap'

        });
        //load locations from pins entries
        for (i = 0; i < pins.length; i++) {
            marker = new google.maps.Marker({
                position: { lat: pins[i].location.lat, lng: pins[i].location.lng },
                map: map,
                title: pins[i].city + ', ' + pins[i].country,
                index: i
            });
            marker.addListener('click', function () {
                $scope.setModal(this.index);
                $("#myModal").modal();
            });
        }
    };
   $scope.getCoords = function(theUrl, i) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                $scope.setCoords(xmlHttp.responseText, i);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    };

    $scope.setCoords = function(response, i) {
        var data = JSON.parse(response);
        $scope.pins[i].location = data.results[0].geometry.location;
    }

    $scope.Coords = function (callback) {

        for (i = 0; i < $scope.pins.length; i++) {
            url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + $scope.pins[i].city + ',+' + $scope.pins[i].country + '&key=AIzaSyA5qu-uA1aIWCW1XpGheVEZhXU-30b9vWY';
            $scope.getCoords(url, i);
        }
        callback();
    }
    $scope.Coords(function () {
        setTimeout(function () { $scope.initMap($scope.pins); }, 200);//only doing for now when hard coded, in reality going to run setCoords when a new post is added
    });
    //initMap($scope.pins);

    $scope.createPost = function(){
        newPin = {
            city: document.getElementById('newPostCity').value,
            country: document.getElementById('newPostCountry').value,
            location: {
                "lat": 0,
                "lng": 0
            },
            date: new Date(document.getElementById('newPostDate').value),
            text: document.getElementById('newPostText').value,
            icon: document.getElementById('newPostImage').value
        }
        //reset fields
        document.getElementById('newPostCity').value = "";
        document.getElementById('newPostCountry').value = "";
        document.getElementById('newPostDate').value = "";
        document.getElementById('newPostText').value = "";
        document.getElementById('newPostImage').value = "";

        $scope.pins.push(newPin);
        setTimeout(function(){
            $scope.Coords(function () {
                setTimeout(function () { $scope.initMap($scope.pins); }, 300);//only doing for now when hard coded, in reality going to run setCoords when a new post is added
            })},300);
    }

    $scope.countries = {};
    $scope.places = new Set();
    $scope.addFB = function (photos) {
        var notNew = 1;
        for (i = 0; i < photos.length; i++) {
            notNew = 1;
            if (photos[i].place != null) {
                for (j = 0; j < $scope.pins.length; j++) {
                    console.log('testing' + $scope.pins[j].location.city);
                    if ($scope.pins[j].city == photos[i].place.location.city) {
                        $scope.pins[j].photos.push(photos[i]);
                        console.log('adding');
                        notNew = 0;
                        break;
                    }
                }
                if (notNew) {
                    console.log('new');
                    newPin = {
                        city: photos[i].place.location.city,
                        country: photos[i].place.location.country,
                        location: {

                            "lat": photos[i].place.location.latitude,
                            "lng": photos[i].place.location.longitude,

                        },
                        date: new Date('2016', '09', '19'),
                        text: 'Manarola is a small town',
                        icon: photos[i].images[0].source,
                        photos: [photos[i]]
                    }
                    console.log(newPin);
                    $scope.pins.push(newPin);
                }

            }
        }
        setTimeout(function () {$scope.initMap($scope.pins); }, 300);
    }

}]);

newPost = function () {
    var appElement = document.querySelector('[ng-app=travelApp]');
    var appScope = angular.element(appElement).scope();
    appScope.$$childHead.createPost();
    
}


changePhoto = function (x) {
    var appElement = document.querySelector('[ng-app=travelApp]');
    var appScope = angular.element(appElement).scope();
    appScope.$$childHead.togglePhoto(x);
}

openNewPostModal = function () {
    $("#newPost").modal();
}

var user_photos = [];

addFacebook = function () {
    var appElement = document.querySelector('[ng-app=travelApp]');
    var appScope = angular.element(appElement).scope();
    appScope.$$childHead.addFB(user_photos);
}
