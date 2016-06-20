'use strict';

app.controller('Step1Ctrl', function($scope, $sce, $document, AppFactory, UserMedia) {

    var pictureWidth;
    var pictureHeight;

    $scope.getVideo = function() {
        AppFactory.checkRequirements()
            .then(captureVideo())
            .done(function() {
                angular.element(document.querySelector('#takePicture')).removeAttr('disabled');
                angular.element(document.querySelector('#step1 figure')).removeClass('not-ready');
            })
            .fail(function(error) {
                showError(error);
            });
    }

    var captureVideo = function() {
        UserMedia.get()
        .then(function(stream) {            
            $scope.videostream = $sce.trustAsResourceUrl(window.URL.createObjectURL(stream));
            window.stream = stream; // stream available to console for dev
            
            // $scope.videostream.addEventListener("loadedmetadata", function(e) {
            //     //get video width and height if different than we requested
            //     pictureWidth = this.videoWidth;
            //     pictureHeight = this.videoHeight;
            // })
            console.log('all done in capture video');
        });
    };
})
