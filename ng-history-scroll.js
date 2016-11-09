/*
    Angular history scroll
    Author: Jester Simpps
    Copyright (c) 2016 Jester Simpps - jestersimpps.github.io , released under the MIT license.
*/

/* shows a timeline of posts where you can scroll through */

(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports = factory(require('angular'));
  } else {
    return factory(root.angular);
  }
}(this, function(angular) {
  'use strict';

  // interval
  var INTERVAL_DELAY = 10;

  //style additions:
  var s = document.createElement("style");
  s.type = "text/css";
  s.innerHTML = '';
  document.body.appendChild(s);

  var moduleName = 'historyScroll';
  var mod = angular.module(moduleName, []);
  mod.directive('historyScroll', ['$window', '$anchorScroll', '$location', function($window, $anchorScroll, $location) {
    return {
      restrict: 'E',
      template: '<div class="dayStrip">' +
        '<div class="dayblock  black white-text"  ng-repeat="day in days">' +
        '[[day.date | date: \'EEE MMM d\']]' +
        '<span class="badge grey darken-3 pull-right">[[day.posts]]</span>' +
        '</div>' +
        '<div class="monthblock  orange darken-4 white-text"  ng-repeat="month in months">' +
        '[[month.date | date: \'MMM\']]' +
        '<span class="badge grey darken-3 pull-right">[[month.posts]]</span>' +
        '</div>' +
        '<div id="di" class="dayIndicator" >' +
        '</div>' +
        '<div class="postStrip z-depth-1">' +
        '<div id="pb[[$index]]" '+
        'class="postblock text-right"'+
        'ng-repeat="block in postblocks | orderBy: [[-sortBy]] track by $index" '+
        'ng-class="block.class" ng-click="scrollTo(block.id)"'+
        'back-img="[[block.images[0].url | unsafe]]">' +
        '<img ng-show="block.favicon" ng-src="[[block.favicon | unsafe]]" alt="" class="historyfavicon" />' +
        '<img ng-hide="block.favicon" ng-src="/img/deffavicon.png" alt="" class="historyfavicon" />' +
        '</div>' +
        '<div id="bi" class="blockIndicator">' +
        '</div>' +
        '<div id="it" class="IndicatorText">' +
        '[[selected]]' +
        '</div>',
      scope: {
        contentblocks: '='
      },
      link: function(scope, element, attrs) {

        scope.sortBy = attrs.sortby;
        scope.postblocks = [];

        var interval,
          spacebetween = parseInt(attrs.spacebetween),
          handler,
          el = angular.element(attrs.scrollparent)[0],
          scrollEvent = 'scroll',
          scrollPosition = 0,
          viewfieldHeight = $window.innerHeight,
          indicatorheight = 0,
          scrollareaHeight = 0,
          offset = parseInt(attrs.topoffset),
          offsetViewfieldHeight = viewfieldHeight - offset,
          offsetScrollHeight = 0;

        var raf = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          window.oRequestAnimationFrame;

        if (raf) {
          loop();
        }

        scope.scrollTo = function(id) {
          $location.hash(id);
          $anchorScroll();
        }

        function loop() {
          if (scrollPosition == el.scrollTop) {
            raf(loop);
            return;
          } else {
            scrollPosition = el.scrollTop;
            moveIndicator();
            raf(loop);
          }
        }

        console.log(angular.element(attrs.scrollparent));

        scope.$watch('contentblocks', function(newValue, oldValue) {
          if (newValue)
            setTimeout(function() {
              scope.postblocks = scope.contentblocks;
              offsetScrollHeight = el.scrollHeight - offset;
              indicatorheight = parseInt(offsetViewfieldHeight * offsetViewfieldHeight / offsetScrollHeight)
              createDayBlocks($window.innerHeight);
              createMonthBlocks($window.innerHeight)
              createPostBlocks($window.innerHeight, el.scrollHeight, newValue.length);
              moveIndicator();
            }, 100);
        }, true);



        function createPostBlocks(vf, sa, elements) {
          viewfieldHeight = vf
          scrollareaHeight = sa;
          var postblockelms = document.getElementsByClassName(attrs.blockclass);
          for (var i = 0; i < postblockelms.length; i++) {
            angular.element('#pb' + i).height((offsetViewfieldHeight * (postblockelms[i].scrollHeight+spacebetween) / offsetScrollHeight) - 7);
          }
        }

        function createDayBlocks(vf) {
          scope.days = [];
          var nod = moment().endOf('month').get('date') - (moment().endOf('month').get('date') - moment().get('date'));
          for (var i = 0; i < nod; i++) {
            scope.days.push({
              id: i,
              date: moment().subtract(i, 'days').format(),
              posts: getRand(100)
            })
          }
        }

        function createMonthBlocks(vf) {
          scope.months = [];
          var nom = moment().endOf('year').get('month') - (moment().endOf('year').get('month') - moment().get('month'));
          for (var i = 0; i < nom; i++) {
            scope.months.push({
              id: i,
              date: moment().subtract(i + 1, 'months').format(),
              posts: getRand(5000)
            })
          }
        }

        function scrollblock() {
          // for (var i = 0; i < scope.contentblocks.length; i++) {
          //   if (angular.element('#pb' + scope.contentblocks[i].id).top() <=  offsetScrollHeight) {
          //     scope.selected = scope.contentblocks[i].site_name;
          //   }
          // }
        }


        function getRand(top) {
          return Math.floor((Math.random() * top) + 1);
        }

        function moveIndicator() {
          var indicatortop = parseInt((scrollPosition * offsetViewfieldHeight / offsetScrollHeight) + offset);;

          angular.element('#bi').css({
            top: indicatortop + 'px',
            height: indicatorheight + 'px'
          });
          // angular.element('#it').css({
          //   top: indicatortop + indicatorheight / 2 + 'px'
          // });
          scrollblock();
        }

      }
    }
  }])


  return moduleName;
}));
