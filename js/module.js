'use strict';

var app = angular.module('app', ['ui.router']);

app.config(function($urlRouterProvider){
	$urlRouterProvider.when('', '/step1');
})

app.run(function ($rootScope) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    console.error('Error transitioning from "' + fromState.name + '" to "' + toState.name + '":', error);
  });
});
