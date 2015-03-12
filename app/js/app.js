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
            controller: 'CountryCtrl'
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
            params: {username: 'ilad', type: 'JSON'}
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
    .service('neighborursService', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    this.getData = function(geonameId) {
        // $http() returns a $promise that we can add handlers with .then()
        return $http({
            method: 'GET',
            url: 'http://api.geonames.org/neighbours',
            params: {username: 'ilad', geonameId: geonameId, type: 'JSON' }
         });
     }
    })
    // .service('flagService', function($http) {
    // delete $http.defaults.headers.common['X-Requested-With'];
    // this.getData = function(countryCode) {
    //     // $http() returns a $promise that we can add handlers with .then()
    //     return $http({
    //         method: 'GET',
    //         url: 'http://www.geonames.org/flags/x/'+countryCode.toLowerCase()+'.gif'
    //      });
    //  }
    // })
    // .service('mapService', function($http) {
    // delete $http.defaults.headers.common['X-Requested-With'];
    // this.getData = function(countryCode) {
    //     // $http() returns a $promise that we can add handlers with .then()
    //     return $http({
    //         method: 'GET',
    //         url: 'http://www.geonames.org/img/country/250/'+countryCode.toUpperCase()+'.png'
    //      });
    //  }
    // })
    .controller('CountryCtrl', function($scope, $routeParams, countriesService, capitalService, neighborursService) {
        $scope.country = null;

        countriesService.getData().then(function(dataResponse) {
            $scope.country = _.where(dataResponse.data.geonames, {countryCode: $routeParams.country})[0];

            // TODO: pass city and country dynamically
            // capitalService.getData($routeParams.country.capital, $routeParams.countryName).then(function(dataResponse) {
            capitalService.getData($scope.country.capital, $scope.country.countryCode).then(function(dataResponse) {
                $scope.capital = dataResponse.data.geonames[0];

                //TODO: make a separate function and call it from here
                neighborursService.getData($scope.country.geonameId).then(function(dataResponse){
                    $scope.neighbours = dataResponse.data.geonames;
                });
            });

        });
    });