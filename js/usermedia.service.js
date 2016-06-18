'use strict';

app.service('UserMedia', ['$q', function($q) {

	var pictureWidth = 640;
	var pictureHeight = 360;

	console.log('in the usermedia service now')

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var videoSettings = {
        video: {
            optional: [
                {
                    width: {min: pictureWidth}
                },
                {
                    height: {min: pictureHeight}
                }
            ]
        }
    };

    var deferred = $q.defer();

    var get = function() {
        navigator.getUserMedia(
            videoSettings,
            function(stream) {       
            	console.log('stream succesfully resolved')      	
            	deferred.resolve(stream); 
            },
            function errorCallback(error) {
                console.log('navigator.getUserMedia error: ', error);
                deferred.reject(error);
            }
        );

        return deferred.promise;
    }

    return {
        get: get
    }

}]);


