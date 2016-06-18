'use strict';

app.controller('AppCtrl', function($scope, $sce, AppFactory, UserMedia) {

    $scope.step1 = function() {
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
        UserMedia.get().then(function(stream) {            
            $scope.videostream = $sce.trustAsResourceUrl(window.URL.createObjectURL(stream));
            window.stream = stream; // stream available to console for dev
            
            $scope.videostream.addEventListener("loadedmetadata", function(e) {
                //get video width and height if different than we requested
                pictureWidth = this.videoWidth;
                pictureHeight = this.videoHeight;
            })
            console.log('all done in capture video');

        });
    };

    AppFactory.step2 = function() {
        var canvas = document.querySelector('#step2 canvas');
        var img = document.querySelector('#step2 img');

        //setup canvas
        canvas.width = pictureWidth;
        canvas.height = pictureHeight;

        var ctx = canvas.getContext('2d');

        //draw picture from video on canvas
        ctx.drawImage(video, 0, 0);

        //modify the picture using glfx.js filters
        texture = fxCanvas.texture(canvas);
        fxCanvas.draw(texture)
            .hueSaturation(-1, -1)//grayscale
            .unsharpMask(20, 2)
            .brightnessContrast(0.2, 0.9)
            .update();

        window.texture = texture;
        window.fxCanvas = fxCanvas;

        $(img)
            //setup the crop utility
            .one('load', function () {
                if (!$(img).data().Jcrop) {
                    $(img).Jcrop({
                        onSelect: function () {
                            //Enable the 'done' button
                            $('#adjust').removeAttr('disabled');
                        }
                    });
                } else {
                    //update crop tool (it creates copies of <img> that we have to update manually)
                    $('.jcrop-holder img').attr('src', fxCanvas.toDataURL());
                }
            })
            //show output from glfx.js
            .attr('src', fxCanvas.toDataURL());
    }    


})
