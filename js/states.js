'use strict';

app.config(function ($stateProvider) {

  $stateProvider.state('step1', {
    url: '/step1',
    templateUrl: '/js/templates/step1.html',
    controller: 'Step1Ctrl'
  });

  $stateProvider.state('step2', {
    url: '/step2',
    templateUrl: '/js/templates/step2.html',
    controller: 'Step2Ctrl'
  });

  $stateProvider.state('step3', {
    url: '/step3',
    templateUrl: '/js/templates/step3.html',
    controller: 'Step3Ctrl'
  });

});
