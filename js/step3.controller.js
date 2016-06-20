'use strict';

app.controller('Step3Ctrl', function($scope, $http, AppFactory) {

    AppFactory.returnCroppedPic();

    AppFactory.ocrText()
    	.then(function(text){
    		$scope.ocr = {
    			text: text
    		};
    		$scope.$digest();
    	});

    $scope.translate = function(text){
    	AppFactory.translateText(text)
        .then(function(response){
            console.log('response from translation', response);
            $scope.translation = response;
        })
    }

    $scope.searchRecipes = function(keywords) {
    	return AppFactory.getRecipe(keywords)
    	.then(function(response){ 
    		var recipesArray = response.recipes
    		console.log('recipes array', response)
    		var rand = recipesArray[Math.floor(Math.random() * recipesArray.length)];
    		$scope.recipeName = rand.title; 
    		$scope.recipePicture = rand.image_url; 
    		$scope.recipeLink = rand.source_url; 
    	});
    }
})
