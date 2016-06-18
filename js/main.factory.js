'use strict';

app.factory('AppFactory', function($q){

	var AppFactory = {};

	var pictureWidth = 640;
	var pictureHeight = 360;

	var fxCanvas = null;
	var texture = null;

	var resultText = "";

	function translateText(response) {
	    console.log('in callback func', response)
	    document.getElementById("translation").innerHTML += "<br>" + response.data.translations[0].translatedText;
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

	AppFactory.step3 = function() {
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

	AppFactory.step4 = function() {

	    var newScript = document.createElement('script');
	    newScript.type = 'text/javascript';
	    // var sourceText = escape(document.getElementById("result").innerHTML);
	    // var sourceText = "Hello";

	    var text = "Bonjour";
	    var apiKey="AIzaSyCoYObAJVWuXTwdieixOQfpWqoIjE30GCw";
	    var src="fr";
	    var dest="en";

	    var source = 'https://www.googleapis.com/language/translate/v2?key='+apiKey+'&source='+src+'&target='+dest+'&callback=translateText&q=' + text;


	    newScript.src = source;
	    document.getElementsByTagName('head')[0].appendChild(newScript);

	}
	return AppFactory;

})