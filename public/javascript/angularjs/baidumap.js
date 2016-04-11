/**
 *  A directive which helps you easily show a baidu-map on your page.
 *
 *
 *  Usages:
 *
 *      <baidu-map options='options'></baidu-map>
 *
 *      options: The configurations for the map
 *            .center.longitude[Number]{M}: The longitude of the center point
 *            .center.latitude[Number]{M}: The latitude of the center point
 *            .zoom[Number]{O}:         Map's zoom level. This must be a number between 3 and 19
 *            .navCtrl[Boolean]{O}:     Whether to add a NavigationControl to the map
 *            .scaleCtrl[Boolean]{O}:   Whether to add a ScaleControl to the map
 *            .overviewCtrl[Boolean]{O}: Whether to add a OverviewMapControl to the map
 *            .enableScrollWheelZoom[Boolean]{O}: Whether to enableScrollWheelZoom to the map
 *            .city[String]{M}:         The city name which you want to display on the map
 *            .markers[Array]{O}:       An array of marker which will be added on the map
 *                   .longitude{M}:                The longitude of the marker
 *                   .latitude{M}:                 The latitude of the marker
 *                   .icon[String]{O}:             The icon's url for the marker
 *                   .width[Number]{O}:            The icon's width for the icon
 *                   .height[Number]{O}:           The icon's height for the icon
 *                   .title[String]{O}:            The title on the infowindow displayed once you click the marker
 *                   .content[String]{O}:          The content on the infowindow displayed once you click the marker
 *                   .enableMessage[Boolean]{O}:   Whether to enable the SMS feature for this marker window. This option only available when title/content are defined.
 *
 *  @author      Howard.Zuo
 *  @copyright   Jun 9, 2015
 *  @version     1.2.0
 *
 *  @author fenglin han
 *  @copyright 6/9/2015
 *  @version 1.1.1
 * 
 *  Usages:
 *
 *  <baidu-map options='options' ></baidu-map>
 *  comments: An improvement that the map should update automatically while coordinates changes
 *
 *  @version 1.2.1
 *  comments: Accounding to 史魁杰's comments, markers' watcher should have set deep watch equal to true, and previous overlaies should be removed
 *
 */
(function (global, factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory(require('angular'));
    } else if (typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else {
        factory(global.angular);
    }

}(window, function (angular) {
    'use strict';

    var baiduMapDir = function () {

        // Return configured, directive instance

        return {
            restrict: 'E',
            scope: {
                'options': '='
            },
            link: function ($scope, element, attrs) {

                var defaultOpts = {
                    navCtrl: true,
                    scaleCtrl: true,
                    overviewCtrl: true,
                    enableScrollWheelZoom: true,
                    zoom: 10
                };

                var opts = $scope.options;

                // create map instance
                var map = new BMap.Map(element.find('div')[0]);

                // init map, set central location and zoom level
                // add navigation control
                map.addControl(new BMap.NavigationControl());
                // add scale control
                map.addControl(new BMap.ScaleControl());
                //add overview map control
                map.addControl(new BMap.OverviewMapControl());
                //enable scroll wheel zoom
                map.enableScrollWheelZoom();


                if (!opts.markers) {
                    return;
                }
                //create markers

                var mark = function () {
                    var lines = opts.markers.map(function (d) {
                        return new BMap.Point(d.longitude, d.latitude);
                    });
                    var polyline = new BMap.Polyline(lines, {
                        strokeColor: "blue",
                        strokeWeight: 2,
                        strokeOpacity: 0.5
                    });
                    if (lines.length > 0) {
                        var start = lines[lines.length - 1];
                        var end = lines[0];

                        var startIcon = new BMap.Icon("/start.png", new BMap.Size(40, 100));
                        var startMarker = new BMap.Marker(start, {
                            icon: startIcon
                        });
                        if (opts.markers[0].current_state == '已送达' || opts.markers[0].current_state == '已评价') {
                            var endIcon = new BMap.Icon("/end.png", new BMap.Size(40, 100));
                            var endMarker = new BMap.Marker(end, {
                                icon: endIcon
                            });
                            map.addOverlay(endMarker);
                        } else if (opts.markers[0].current_state == '运送中') {
                            var endIcon = new BMap.Icon("/ing.png", new BMap.Size(40, 100));
                            var endMarker = new BMap.Marker(end, {
                                icon: endIcon
                            });
                            map.addOverlay(endMarker);
                        }

                        map.addOverlay(startMarker);
                    }

                    map.addOverlay(polyline);
                };

                mark();

                $scope.$watch('options.center', function (newValue, oldValue) {
                    opts = $scope.options;
                    map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
                    mark();
                }, true);

                $scope.$watch('options.markers', function (newValue, oldValue) {
                    mark();
                }, true);
            },
            template: '<div style="width: 100%; height: 100%;"></div>'
        };
    };

    var baiduMap = angular.module('baiduMap', []);
    baiduMap.directive('baiduMap', [baiduMapDir]);
}));
