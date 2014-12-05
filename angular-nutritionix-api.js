(function (window, angular, undefined) {
    'use strict';

    /**
     * @ngdoc overview
     * @name index
     *
     * @description
     * Angularjs client library to make calls to nutritionix API
     */

    /**
     * @ngdoc overview
     * @name nix.api
     *
     * @description
     * Angular module containing all library functionaluty
     *
     * @type {ng.IModule}
     */
    var module = angular.module('nix.api', []);

    /**
     * @ngdoc function
     * @name nix.api.functions:deepMerge
     * @function
     * @param {object} a First object
     * @param {object} b Second object
     *
     * @description
     *
     * Deep merge for any number of objects as arguments
     *
     * Accessible as direct method of the module object <pre>angular.module('nix.api').deepMerge(a, b);</pre>
     *
     * @returns {object} Resulting object
     */
    module.deepMerge = function deepMerge(a, b) {
        var result, property;

        if (arguments.length > 2) {
            return deepMerge(a, deepMerge.apply(null, Array.prototype.slice.call(arguments, 1)));
        }

        result = angular.copy(a);
        for (property in b) if (b.hasOwnProperty(property)) {
            if (
                result.hasOwnProperty(property) &&
                angular.isObject(result[property]) &&
                angular.isObject(b[property])
                ) {
                result[property] = deepMerge(result[property], b[property]);
            } else {
                result[property] = angular.copy(b[property]);
            }
        }

        return result;
    };


    /**
     * @ngdoc service
     * @name  nix.api.provider:nixApiProvider
     *
     * @description
     *
     * Used for configuring {@link nix.api.service:nixApi} service
     */
    module.provider('nixApi', function nixApiProvider() {
        var apiEndpoint = 'https://api.nutritionix.com/v2/',
            credentials = {},
            httpConfig = {};


        /**
         * @ngdoc method
         * @methodOf nix.api.provider:nixApiProvider
         * @name nix.api:nixApiProvider#setEndpoint
         * @param {string} endpoint Allows to change nutritionix api base endpoint.
         *                          Defaults to https://api.nutritionix.com/v2/
         */
        this.setApiEndpoint = function (endpoint) {
            apiEndpoint = endpoint;
        };

        /**
         * @ngdoc method
         * @methodOf nix.api.provider:nixApiProvider
         * @name nix.api.provider:nixApiProvider#setEndpoint
         * @param {string} appId Application id
         * @param {string} appKey Application Key
         *
         * @description Set api credentials generated at https://developer.nutritionix.com portal
         */
        this.setApiCredentials = function (appId, appKey) {
            credentials.appId = appId;
            credentials.appKey = appKey;
        };

        /**
         * @ngdoc method
         * @methodOf nix.api.provider:nixApiProvider
         * @name nix.api.provider:nixApiProvider#setHttpConfig
         * @param {object} value configuration object compatible with
         *                       https://docs.angularjs.org/api/ng/service/$http#usage
         *
         * @description Set service-wide override for http calls configuration object
         *                       https://docs.angularjs.org/api/ng/service/$http#usage
         */
        this.setHttpConfig = function (value) {
            if (angular.isObject(value)) {
                httpConfig = value;
            }
        };


        this.$get = function nixApiFactory($http) {

            /**
             * @ngdoc service
             * @name  nix.api.service:nixApi
             * @function
             *
             * @description
             *
             * Used to make calls to nutritionix api
             * Low level function to build api client on top of.
             *
             * @param {string} endpoint Relative api endpoint url e.g. '/estimated-nutrition/bulk'
             * @param {object} config Call-specific override for http calls configuration object
             *                        https://docs.angularjs.org/api/ng/service/$http#usage
             *                        The last override in chain of default object and
             *                        {@link nix.api.provider:nixApiProvider#methods_sethttpconfig} to form final http call config.
             *
             *                        Default object is built like that:
             *                        <pre>
             *                            {
             *                                  method:            'GET',
             *                                  url:               'https://api.nutritionix.com/v2' + endpoint,
             *                                  headers:           {
             *                                      'X-APP-ID':  credentials.appId,
             *                                      'X-APP-KEY': credentials.appKey
             *                                  },
             *                                  params:            {}
             *                              }
             *                            </pre>
             */
            var nixApi = function (endpoint, config) {
                config = module.deepMerge(
                    {
                        method:            'GET',
                        url:               'https://api.nutritionix.com/v2' + endpoint,
                        headers:           {
                            'X-APP-ID':  credentials.appId,
                            'X-APP-KEY': credentials.appKey
                        },
                        params:            {}
                    },
                    httpConfig,
                    config
                );

                return $http(config);
            };

            return nixApi;
        };
    });

    /**
     * @ngdoc filter
     * @name nix.api.filter:nutrient
     * @function
     *
     * @description
     * Finds nutrition with specified id in array of nutrients
     *
     * @param {array} nutrients Collection of nutrients
     * @param {string} id Nutrient attr_id to search for
     * @param {string} [attribute] property to immediately return from found nutrient
     *
     * @returns {mixed} Nutrient object itself, or it's property named with the third param
     *
     */
    module.filter('nutrient', function () {
        return function nutrient(nutrients, id, attribute) {
            var i;
            id = parseInt(id);
            if (id && angular.isArray(nutrients)) {
                for (i in nutrients) if (nutrients.hasOwnProperty(i)) {
                    if (parseInt(nutrients[i].attr_id) === id) {
                        return attribute ? nutrients[i][attribute] : nutrients[i];
                    }
                }
            }

            return null;
        };
    });
})(window, window.angular);
