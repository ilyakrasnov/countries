'use strict';

/* configurations */

var app = angular.module('countriesApp', ['ngResource']);

// route configurations
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: ''
        })
        .when('/countries', {
            templateUrl: 'views/countries.html',
            controller: 'CountriesCtrl'
        })
        .when('/countries/:country', {
            templateUrl: 'views/country.html',
            controller: 'CountryCtrl',
            resolve: {
                country: function($route, countriesService, capitalService){
                    // console.log($route.current.params.country);
                    return countriesService.getData().then(function(dataResponse){
                        return _.where(dataResponse.data.geonames, {countryCode: $route.current.params.country})[0];
                    })
                    .then(function(country){
                        return capitalService.getData(country.capital, country.countryCode)
                            .then(function(dataResponse){
                                country.capital_information = dataResponse.data.geonames[0]
                                return country;
                            });
                    });
                },
                neighbours: function($route, neighboursService){
                    return neighboursService.getData($route.current.params.country);
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    }])
    .service('countriesService', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    this.getData = function() {
        // $http() returns a $promise that we can add handlers with .then()
        return $http({
            method: 'GET',
            url: 'http://api.geonames.org/countryInfo',
            params: {username: 'ilad', type: 'JSON'},
            cache: true
         });
     }
    })
    .controller('CountriesCtrl', function($scope, countriesService) {
        $scope.countries = null;
        countriesService.getData().then(function(dataResponse) {
            $scope.countries = dataResponse.data;
            console.log($scope.countries);
        });
    })
    .service('capitalService', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    this.getData = function(city, country) {
        // $http() returns a $promise that we can add handlers with .then()
        return $http({
            method: 'GET',
            url: 'http://api.geonames.org/searchJSON',
            params: {username: 'ilad', q: city, country: country, name_equals: city , isNameRequired: true, type: 'JSON' }
         });
     }
    })
    .service('neighboursService', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    this.getData = function(countryCode) {
        // $http() returns a $promise that we can add handlers with .then()
        return $http({
            method: 'GET',
            url: 'http://api.geonames.org/neighbours',
            params: {username: 'ilad', country: countryCode, type: 'JSON' }
         })
        .then(function(dataResponse){
            return dataResponse.data.geonames;
        });
     }
    })
    .controller('CountryCtrl', function($scope, country, neighbours) {
        $scope.country = country;
        $scope.neighbours = neighbours;
        $scope.capital = country.capital_information;
    });