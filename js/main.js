function translateText(response) {
    console.log('in callback func', response)
    document.getElementById("translation").innerHTML += "<br>" + response.data.translations[0].translatedText;
}

$(document).ready(function () {
    var video = document.querySelector('video');

    var pictureWidth = 640;
    var pictureHeight = 360;

    var fxCanvas = null;
    var texture = null;

    var resultText = "";

    function checkRequirements() {
        var deferred = new $.Deferred();

        //Check if getUserMedia is available
        if (!Modernizr.getusermedia) {
            deferred.reject('Your browser doesn\'t support getUserMedia (according to Modernizr).');
        }

        //Check if WebGL is available
        if (Modernizr.webgl) {
            try {
                //setup glfx.js
                fxCanvas = fx.canvas();
            } catch (e) {
                deferred.reject('Sorry, glfx.js failed to initialize. WebGL issues?');
            }
        } else {
            deferred.reject('Your browser doesn\'t support WebGL (according to Modernizr).');
        }

        deferred.resolve();

        return deferred.promise();
    }

    // function searchForRearCamera() {
    //     var deferred = new $.Deferred();

    //     //MediaStreamTrack.getSources seams to be supported only by Chrome
    //     if (MediaStreamTrack && MediaStreamTrack.getSources) {
    //         MediaStreamTrack.getSources(function (sources) {
    //             var rearCameraIds = sources.filter(function (source) {
    //                 return (source.kind === 'video' && source.facing === 'environment');
    //             }).map(function (source) {
    //                 return source.id;
    //             });

    //             if (rearCameraIds.length) {
    //                 deferred.resolve(rearCameraIds[0]);
    //             } else {
    //                 deferred.resolve(null);
    //             }
    //         });
    //     } else {
    //         deferred.resolve(null);
    //     }
    //     return deferred.promise();
    // }

    function setupVideo(rearCameraId) {

        var deferred = new $.Deferred();
        //Modernizr.prefixed takes a string css value in the DOM style camelCase form ('getUserMedia') & returns the (possibly prefixed) version of that property that the browser actually supports on the navigator object
        var getUserMedia = Modernizr.prefixed('getUserMedia', navigator);
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
        //if rear camera is available - use it
        // if (rearCameraId) {
        //     videoSettings.video.optional.push({
        //         sourceId: rearCameraId
        //     });
        // }
        getUserMedia(videoSettings, function (stream) {
            //Setup the video stream
            video.src = window.URL.createObjectURL(stream);

            window.stream = stream;

            video.addEventListener("loadedmetadata", function (e) {
                //get video width and height as it might be different than we requested
                pictureWidth = this.videoWidth;
                pictureHeight = this.videoHeight;

                if (!pictureWidth && !pictureHeight) {
                    //firefox fails to deliver info about video size on time (issue #926753), we have to wait
                    var waitingForSize = setInterval(function () {
                        if (video.videoWidth && video.videoHeight) {
                            pictureWidth = video.videoWidth;
                            pictureHeight = video.videoHeight;

                            clearInterval(waitingForSize);
                            deferred.resolve();
                        }
                    }, 100);
                } else {
                    deferred.resolve();
                }
            }, false);
        }, function () {
            deferred.reject('There is no access to your camera, have you denied it?');
        });
        return deferred.promise();

    }

    function step1() {
        checkRequirements()
            // .then(searchForRearCamera)
            .then(setupVideo)
            .done(function () {
                //Enable the 'take picture' button
                $('#takePicture').removeAttr('disabled');
                //Hide the 'enable the camera' info
                $('#step1 figure').removeClass('not-ready');
            })
            .fail(function (error) {
                showError(error);
            });
    }

    function step2() {
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

    function step3() {
        var canvas = document.querySelector('#step3 canvas');
        var step2Image = document.querySelector('#step2 img');
        var cropData = $(step2Image).data().Jcrop.tellSelect();

        var scale = step2Image.width / $(step2Image).width();

        //draw cropped image on the canvas
        canvas.width = cropData.w * scale;
        canvas.height = cropData.h * scale;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(
            step2Image,
            cropData.x * scale,
            cropData.y * scale,
            cropData.w * scale,
            cropData.h * scale,
            0,
            0,
            cropData.w * scale,
            cropData.h * scale);

        //use Tesseract.js to extract text from the canvas
        Tesseract.recognize(ctx, {
            // progress: show_progress, 
            lang: 'fra'} )
        .then(function(result){
            console.log('RESULT HERE', result);
            resultText = result.text;
            // resultText = resultText.trim();
            console.log('trimmed text', resultText);
        })

        //show the result
        $('blockquote p').html('&ldquo;' + resultText + '&ldquo;');
        $('blockquote footer').text('(' + resultText.length + ' characters)')
        $('#translate').removeAttr('disabled');

    }

    function step4() {
        console.log('you are in step 4 now!')

        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        // var sourceText = escape(document.getElementById("result").innerHTML);
        // var sourceText = "Hello";

        var text = "Bonjour";
        var apiKey="AIzaSyCoYObAJVWuXTwdieixOQfpWqoIjE30GCw";
        var src="fr";
        var dest="en";

        var source = 'https://www.googleapis.com/language/translate/v2?key='+apiKey+'&source='+src+'&target='+dest+'&callback=translateText&q=' + text;

        console.log('url here', source)

        newScript.src = source;
        document.getElementsByTagName('head')[0].appendChild(newScript);
        // document.getElementByTagName('blockquote')[0].appendChild(newScript);
        // document.getElementById('result').appendChild(newScript);

        //show the result
        // $('#result').html('&ldquo;' + resultText + '&ldquo;');
        // $('#translation').html('&ldquo;' + translation + '&ldquo;');
        // $('#translation').html('&ldquo;' + newScript + '&ldquo;');
    }


    /*********************************
     * UI Stuff
     *********************************/

    //start step1 immediately
    step1();
    $('.help').popover();

    function changeStep(step) {
        if (step === 1) {
            video.play();
        } else {
            video.pause();
        }

        $('body').attr('class', 'step' + step);
        $('.nav li.active').removeClass('active');
        $('.nav li:eq(' + (step - 1) + ')').removeClass('disabled').addClass('active');
    }

    function showError(text) {
        $('.alert').show().find('span').text(text);
    }

    //handle brightness/contrast change
    $('#brightness, #contrast').on('change', function () {
        var brightness = $('#brightness').val() / 100;
        var contrast = $('#contrast').val() / 100;
        var img = document.querySelector('#step2 img');

        fxCanvas.draw(texture)
            .hueSaturation(-1, -1)
            .unsharpMask(20, 2)
            .brightnessContrast(brightness, contrast)
            .update();

        img.src = fxCanvas.toDataURL();

        //update crop tool (it creates copies of <img> that we have to update manually)
        $('.jcrop-holder img').attr('src', fxCanvas.toDataURL());
    });

    $('#takePicture').click(function () {
        step2();
        changeStep(2);
    });

    $('#adjust').click(function () {
        step3();
        changeStep(3);
    });

    $('#translate').click(function () {
        step4();
        changeStep(4);
    });

    $('#go-back').click(function () {
        changeStep(2);
    });

    $('#start-over').click(function () {
        changeStep(1);
    });
    //should really only be for the buttons at the bottom/changing step forcefully
    $('.nav').on('click', 'a', function () {
        if (!$(this).parent().is('.disabled')) {
            var step = $(this).data('step');
            changeStep(step);
        }
        return false;
    });
});
