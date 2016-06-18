'use strict';

app.config(function ($stateProvider) {

  $stateProvider.state('step1', {
    url: '/step1',
    templateUrl: '/js/templates/step1.html',
    controller: 'AppCtrl'
  });

  $stateProvider.state('step2', {
    url: '/step2',
    templateUrl: '/js/templates/step2.html',
    controller: 'AppCtrl',
    resolve: {

    }
  });

  $stateProvider.state('step3', {
    url: '/step3',
    templateUrl: '/js/templates/step3.html',
    controller: 'AppCtrl',
    resolve: {

    }
  });

  $stateProvider.state('step4', {
    url: '/step4',
    templateUrl: '/js/templates/step4.html',
    controller: 'AppCtrl',
    resolve: {

    }
  });

});
