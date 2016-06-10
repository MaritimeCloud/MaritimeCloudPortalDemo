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
    
    .filter('replaceNewlines', function () {
        return function (string) {
        	var replaceString = "\n";
        	if (navigator.appVersion.indexOf("Win")!=-1){
        		replaceString = "\r\n";
        	}
            return (!string) ? '' : string.replace(/(\r\n|\n|\r)/gm, "").replace(/(\\n)/gm, replaceString);
        };
    })
    ;
