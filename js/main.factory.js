'use strict';

app.factory('AppFactory', function($q, $http, UserMedia){

	var AppFactory = {};

	var pictureWidth = 640;
	var pictureHeight = 360;

	var fxCanvas = null;
	var texture = null;

	var resultText = "";

	var video = document.querySelector('video');

	var canvas;
	var step2Image;
	var ctx; 

	function changeStep(step) {
	    if (step === 1) {
	        video.play();
	    } else {
	        video.pause();
	    }
	    $('.nav li.active').removeClass('active');
	    $('.nav li:eq(' + (step - 1) + ')').removeClass('disabled').addClass('active');
	}

	AppFactory.checkRequirements = function() {
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

	AppFactory.cropAndFilterPic = function() {

		changeStep(2);

		var canvas = document.querySelector('#step2 canvas');
		var img = document.querySelector('#step2 img');
        //setup canvas
        canvas.width = pictureWidth;
        canvas.height = pictureHeight;

        ctx = canvas.getContext('2d');

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

        step2Image = document.querySelector('#step2 img');

    }

	AppFactory.returnCroppedPic = function() {

		changeStep(3);

        var canvas = document.querySelector('#step3 canvas');
	    var cropData = $(step2Image).data().Jcrop.tellSelect();

	    var scale = step2Image.width / $(step2Image).width();

	    //draw cropped image on the canvas
	    canvas.width = cropData.w * scale;
	    canvas.height = cropData.h * scale;

	    ctx = canvas.getContext('2d');
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
	}

	AppFactory.ocrText = function(){
		console.log('in ocrText in factory')
		//use Tesseract.js to extract text from the canvas
		return Tesseract.recognize(ctx, {
		    lang: 'chi_tra'} )
		.then(function(result){
		    resultText = result.text;
		    return resultText;
		})
		.then(null, function(err){
			console.error("ERROR: ", err)
		})
	}

	AppFactory.translateText = function(text) {

	    // var newScript = document.createElement('script');
	    // newScript.type = 'text/javascript';

	    var apiKey="AIzaSyCoYObAJVWuXTwdieixOQfpWqoIjE30GCw";
	    var src="zh-CN";
	    var dest="en";

	    var source = 'https://www.googleapis.com/language/translate/v2?key='+apiKey+'&source='+src+'&target='+dest+'&callback=translateText&q=' + text;
	    // newScript.src = source;
	    // document.getElementsByTagName('head')[0].appendChild(newScript);

	    var accept = "application/json";

	    var config = {
	        url: source,
	        method: 'GET' 
		};

		return $http(config)
		.then(function(response){
			var string = response.data.slice(30, -2); 
			var json = JSON.parse(string);
			return json.data.translations[0].translatedText;
		})
	}

	AppFactory.getRecipe = function(text){

        var apiKey = "e3d340f32c9472e5139bba993a8a0c34";
		var keywords = text.split(' ').join('+')
		var url = 'https://community-food2fork.p.mashape.com/search?key='+apiKey+'&q=' + keywords;
        var headerKey = "fvkWPLvFN8mshQ0t2Vd8fAVOhA4cp1Q5qEpjsn39tYb6NDERks";
        var accept = "application/json";

        var config = {
	        url: url,
	        method: 'GET',
	        headers: {
	            'X-Mashape-Key': headerKey,
	            'accept': accept
	        }
		};

		return $http(config)
		.then(function(response){
			console.log('in success handler')
			return response.data; 
		})
		
	}

	return AppFactory;

})

function translateText (response) {
    console.log('in callback func', response)
    document.getElementById("translation").innerHTML += "<br>" + response.data.translations[0].translatedText;
    return response.data.translations[0].translatedText;
}