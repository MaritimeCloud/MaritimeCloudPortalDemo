'use strict';

/* Filters */

angular.module('mcp.filters', [])
    .filter('checkmark', function() {
        return function(input) {
            return input ? '\u2713' : '\u2718';
        };
    })
    
    .filter('removeSpaces', function () {
        return function (value) {
            return (!value) ? '' : value.replace(/ /g, '');
        };
    })
    
    .filter('replaceSpaces', function () {
        return function (string, replaceString) {
            return (!string) ? '' : string.replace(/ /g, replaceString);
        };
    })
    
    ;
