'use strict';

angular.module('socialwallIiApp')

.directive('socialItem', function(){
  return {
    restrict: '',
    scope: {
      'type': '='
    },
    controller: function(){

    }
  };
})

.controller('MainCtrl', function($scope, $http, $timeout ){
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  /*---------- From Socialwall ----------*/

  $scope.bricks = [];
  $scope.loopTime = 1000;
  $scope.gifTime = 5000;
  $scope.currType = '';
  $scope.prevType = '';
  $scope.loopTimeout = '';
  $scope.gifTimeout = '';
  $scope.brickHighlight = '';
  $scope.isPaused = false;
  $scope.highVisible = false;
  $scope.activeBrick = 0;
  $scope.activeType = 'random';

  $scope.getPhotos = function(){
    // The offical feed url...
    //$http.get('/app/montagephotos/cfp').success(function(data){

    // Demo feed url
    $http.get('db/feed.json').success(function(data){
      if (data.result === 'success'){
        $scope.bricks.push(data.photos);
        $scope.getNewPhotos();
      } else {
        $scope.loopTimeout = $timeout(function(){
          $scope.getPhotos();
        }, $scope.loopTime);
      }
    });
  };

  $scope.getNewPhotos = function(){
    $timeout.cancel($scope.gifTimeout);
    $timeout.cancel($scope.loopTimeout);
    $scope.highVisible = false;

    // The offical feed url...
    //$http.get('/app/montagephotosnew/cfp').success(function(data){

    // Demo feed url
    $http.get('db/newFeed.json').success(function(data){
      $scope.highVisible = false;
      $scope.loopTimeout = $timeout(function(){
        if (data.result === 'success'){
          if ($scope.activeType === 'random'){
            $scope.activeBrick = $scope.bricks[0].length - 1;
          }
          $scope.activeType = 'sequential';
          $scope.bricks = [$scope.bricks[0].concat(data.photos)];
        }
        if ($scope.activeType === 'sequential' && $scope.activeBrick < $scope.bricks[0].length - 1){
          $scope.activeBrick++;
        } else {
          $scope.activeType = 'random';
          $scope.activeBrick =  $scope.getRandomArbitrary(0, $scope.bricks[0].length - 1);
        }
        $scope.swapContent();
      }, $scope.loopTime);
    });
  };

  $scope.swapContent = function(){
    if ($scope.isPaused === false){
      $scope.brickHighlight = $scope.bricks[0][$scope.activeBrick];
      $scope.highVisible = true;
      $scope.gifTimeout = $timeout(function(){
        $scope.getNewPhotos();
      }, $scope.gifTime);
    }
  };

  $scope.pauseLoop = function(){
    $scope.isPaused = true;
    $timeout.cancel($scope.gifTimeout);
    $timeout.cancel($scope.loopTimeout);
  };

  $scope.addNewLoop = function(){
    $timeout.cancel($scope.gifTimeout);
    $timeout.cancel($scope.loopTimeout);
    $scope.getNewPhotos();
  };

  $scope.getRandomArbitrary = function(min, max){
    return Math.round(Math.random() * (max - min) + min);
  };


  /*---------- Front Socialmap ----------*/

  $scope.postTime = 5000;
  $scope.postLoopTime = 1000;
  $scope.postTimeout = '';
  $scope.postLoopTimeout = '';
  $scope.minPosts = 10;
  $scope.currPost = 0;
  $scope.initRun = true;
  $scope.feedPosts = [];

  $scope.getPosts = function(){
    //$http({method: 'GET', url: '/app/socialfeed/' + $scope.minPosts}).
    $http({method: 'GET', url: 'db/socialFeedNew.json'}).success(function(data){
      if (data.length !== 0){
        if ($scope.initRun === true){
          $scope.feedPosts.push(data);
          $scope.initRun = false;
        } else {
          $scope.feedPosts = [$scope.feedPosts[0].concat(data)];
        }
        $scope.shiftPost();
      } else {
        $timeout(function(){
          $scope.getPosts();
        }, 5000);
      }
    }).
    error(function(data, status){
      console.log(status + ' - Could not load posts');
    });
  };

  $scope.shiftPost = function(){
    $scope.postTime = $scope.feedPosts[0][0].displaytime * 1000;
    $scope.postTimeout = $timeout(function(){
      if ($scope.currType === 'social'){
        angular.element('#social0 .social-inner').slideUp($scope.postLoopTime, function(){
          $scope.nextPost();
        });
      } else {
        angular.element('#social0 .social-inner').animate({ opacity: 0 }, $scope.postLoopTime, function(){
          $scope.nextPost();
        });
      }
    }, $scope.postTime);
  };

  $scope.nextPost = function(){

    $scope.postLoopTimeout = $timeout(function(){
      $scope.feedPosts[0].shift();
      $scope.$apply();
      $scope.prevType = $scope.currType;
      $scope.currType = $scope.findCurrType();

      




      if ($scope.prevType === 'video' && $scope.currType !== 'video'){
        $scope.isPaused = false;
        $scope.swapContent();
      }
      if ($scope.currType === 'video'){
        $scope.pauseLoop();


        angular.element('#socialVideo0').get(0).play();
        angular.element('#socialVideo0').prop('muted', true);


      }

      if ($scope.feedPosts[0].length < $scope.minPosts){
        $scope.getPosts();
      } else {
        $scope.shiftPost();
      }







    }, $scope.postLoopTime);
  };

  $scope.findCurrType = function(){
    var findClass = angular.element('#social0').attr('class');

    console.log(findClass);

    var isImg = findClass.indexOf('montage');
    var isVid = findClass.indexOf('video');
    if (isImg !== -1){
      return 'image';
    } else if (isVid !== -1){
      return 'video';
    } else {
      return 'social';
    }
  };
});