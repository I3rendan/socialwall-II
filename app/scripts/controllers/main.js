'use strict';

angular.module('socialwallIiApp')
.directive('masonryGrid', function(){
  return {
    link: function(){

    }
  };
})

.directive('socialItem', function($timeout){
  return {
    restrict: 'A',
    link: function($scope, element){
      $scope.getSocial = $timeout(function(){
        $scope.feedPostsHeight.push(element.outerHeight(true));
        if ($scope.$last){
          $scope.sortSocial($scope.feedPostsHeight);
        }
      });
    }
  };
})

.controller('MainCtrl', function($scope, $http, $timeout, $window){
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  /*---------- From Socialwall ----------*/

  $scope.bricks = [];
  $scope.bricksDupe = [];
  $scope.data = [];
  $scope.colStyle = [];
  $scope.cycleCount = 0;
  $scope.newLeft = 0;
  $scope.newTop = 0;
  $scope.colNum = 4;
  $scope.loopTime = 1000;
  $scope.gifRunTime = 2000;
  $scope.container = angular.element('#masonry-wrap');

  $scope.getPhotos = function(isInit){
    // The offical feed url...
    //$http.get('/app/montagephotos/cfp').success(function(data){

    // Demo feed url
    $http.get('/db/feed.json').success(function(data){
      if (isInit === true){
        $scope.bricks.push(data.photos);
        $scope.bricksDupe = angular.copy($scope.bricks);
      } else {
        $scope.bricksDupe = [];
        $scope.bricksDupe.push(data.photos);
      }
      $scope.isActive = -1;
      $scope.sizeGrid();
      $scope.getNewPhotos();
    });
  };

  $scope.sizeGrid = function(){
    $scope.colNumWidth = 100 / $scope.colNum;
    $scope.winWidth = $window.innerWidth;
    $scope.winHeight = $window.innerHeight / 2;
    $scope.brickWidth = angular.element('.brick').width();
    $scope.brickHeight = angular.element('.brick').height();
    $scope.colStyle = {'width': $scope.colNumWidth + '%'};
  };

  $scope.sizeNewBrick = function(){
    $scope.newBrickWidth = angular.element('#new-brick').width();
    $scope.newBrickHeight = angular.element('#new-brick').height();
    $scope.newLeft = ($scope.winWidth / 2) - ($scope.newBrickWidth / 2) + 'px';
    $scope.newTop = ($scope.winHeight / 4) - ($scope.newBrickHeight / 4) + 'px';
    $scope.newBrickStyle = {'top': $scope.newTop, 'left': $scope.newLeft};

    // Use manual pixel cause of share message...
    // $scope.newBrickStyle = {'top': '3em', 'left': $scope.newLeft};
  };

  angular.element($window).bind('resize', function(){
    $scope.sizeGrid();
  });

  $scope.getNewPhotos = function(){
    // The offical feed url...
    //$http.get('/app/montagephotosnew/cfp').success(function(data){

    // Demo feed url
    $http.get('/db/newFeed.json').success(function(data){
      $scope.data = [];
      $scope.data.push(data.photos);

      if (data.result === 0){
        $timeout.cancel($scope.gifTimeout);
        $timeout.cancel($scope.loopTimeout);
        $scope.swapContent(false);
        $scope.loopTimeout = $timeout(function(){
          $scope.getNewPhotos();
        }, $scope.loopTime);
      } else {
        $scope.addNewLoop();
      }
    });
  };

  $scope.swapContent = function(isNew){

    $scope.isActive = getRandomArbitrary(0, $scope.bricks[0].length - 1);
    $scope.swapItem = angular.element('#brick' + $scope.isActive);

    if (isNew === true){

      $scope.newBrick = [];
      $scope.cycleCount = 0;
      $scope.newBrick = [];
      $scope.newBrick = $scope.data[0][0];

      $scope.loopTimeout = $timeout(function(){

        $scope.sizeNewBrick();

        $scope.newVisible = true;
        angular.element('#new-brick').animate({opacity: 1}, 500, function(){

          $scope.gifTimeout = $timeout(function(){
            angular.element('#new-brick').animate({opacity: 0}, 500);

            $scope.swapItem.animate({ opacity: 0 }, 500, function(){
              $scope.bricks[0][$scope.isActive] = $scope.newBrick;
              $scope.bricksDupe[0].push($scope.data[0][0]);
              $scope.data[0].shift();
              $scope.newBrick = [];
              $scope.$apply();
              $scope.swapItem.animate({ opacity: 1 }, 500);
            });

            var swapTop = $scope.swapItem.offset().top;
            var swapLeft = $scope.swapItem.offset().left;
            var swapWidth = $scope.swapItem.width();
            var swapHeight = $scope.swapItem.height();

            $scope.newTop = swapTop + (swapHeight / 2) + 'px';
            $scope.newLeft = swapLeft + (swapWidth / 2) + 'px';
            $scope.newBrickStyle = {'top': $scope.newTop, 'left': $scope.newLeft};
            $scope.newVisible = false;
        
            $scope.loopTimeout = $timeout(function(){
              $scope.addNewLoop();
            }, $scope.loopTime);
          }, $scope.gifRunTime);
        });
      }, 1000);
    } else if ($scope.cycleCount === $scope.bricks[0].length / 2){
      $scope.cycleCount = 0;
      $scope.getPhotos(false);
    } else {
      $scope.swapItem.animate({ opacity: 0 }, 500, function(){
        $scope.newBrick = $scope.bricksDupe[0][getRandomArbitrary(0, $scope.bricksDupe[0].length - 1)];
        $scope.bricks[0][$scope.isActive] = $scope.newBrick;
        $scope.$apply();
        $scope.cycleCount++;
        $scope.swapItem.animate({ opacity: 1 }, 500);
      });
    }
  };

  $scope.addNew = function(){
    if ($scope.data[0].length > 0){
      $scope.swapContent(true);
    } else {
      $scope.getNewPhotos();
    }
  };

  $scope.addNewLoop = function(){
    $timeout.cancel($scope.gifTimeout);
    $timeout.cancel($scope.loopTimeout);
    $scope.addNew();
  };

  function getRandomArbitrary(min, max){
    return Math.round(Math.random() * (max - min) + min);
  }

  /*---------- Front Socialmap ----------*/

  $scope.postStatus = 'init';
  $scope.delaySlide = 3600;
  $scope.animationSpeed = 1200;
  $scope.minPosts = 12;
  $scope.feedPosts = [];
  $scope.feedPostsHeight = [];

  $scope.updatePosts = function(data){
    $scope.feedPostsHeight = [];
    $scope.feedPosts = data;
  };

  $scope.loadPosts = function() {
    //$http({method: 'GET', url: '/app/socialfeed/' + $scope.minPosts}).
    $http({method: 'GET', url: 'db/socialFeedNew.json'}).
      success(function(data) {

        if ($scope.postStatus === 'init') {
          $scope.postStatus = 'running';
          $scope.updatePosts(data);
        }
        else if (data.length < $scope.minPosts){
          if (String($scope.feedPosts) !== String(data) && $scope.postStatus !== 'delayed'){
            $scope.feedPosts.push.apply($scope.feedPosts, data.feed);
            $scope.postStatus = 'delayed';
          } else {
            $timeout(function(){
              $scope.loadPosts();
            }, $scope.delaySlide * 3);
          }
        } else {
          if (data.playListOrder === 'random'){
            $scope.feedPosts.push.apply($scope.feedPosts, $scope.shuffleArray(data.feed));
            $scope.postStatus = 'running';
          } else {
            $scope.feedPosts.push.apply($scope.feedPosts, data.feed);
            $scope.postStatus = 'running';
          }
        }
      }).
      error(function(data, status) {
        console.log(status + ' - Could not load posts');
      });
  };

  $scope.removePost = function(){
    angular.element('#social0').slideUp($scope.animationSpeed, function(){
      $scope.feedPosts.shift();
      $scope.feedPostsHeight.shift();
      $scope.$apply();

      if ($scope.feedPosts.length <= $scope.minPosts){
        $scope.loadPosts();
      } else {
        $scope.sortSocial($scope.feedPostsHeight);
      }
    });
  };

  $scope.sortSocial = function(data){
    var findMin = 0;
    var findVH = $window.innerHeight;

    for (var i = 0; i < data.length; i++) {
      findMin += data[i];
      if (findMin >= findVH){
        $scope.minPosts = Math.round(i) * 1.5;

        if ($scope.postStatus === 'delayed'){
          $scope.minPosts = Math.round(i);
        }

        i = data.length;
        $scope.delaySocialRemove();
      }
    }
    if (findMin < findVH){
      $scope.minPosts = Math.round(findVH / findMin) * i;

      $timeout(function(){
        $scope.loadPosts();
      }, $scope.delaySlide);
    }
  };

  $scope.delaySocialRemove = function(){
    $timeout(function(){
      $scope.removePost();
    }, $scope.delaySlide * 1.33);
  };
});