'use strict';

/* Directives */

angular.module('mcp.models', [])
    /**
     * Model for showing certificate revokation reasons
     */
    .factory('CertificateRevocationViewModel', function () {
        var model = {
            reasons: [
                { reasonId: 'unspecified', reasonText: 'Unspecified'},
                { reasonId: 'keycompromise', reasonText: 'Key compromised'},
                { reasonId: 'cacompromise', reasonText: 'CA compromised'},
                { reasonId: 'affiliationchanged', reasonText: 'Afiliation changed'},
                { reasonId: 'superseded', reasonText: 'Superseded'},
                { reasonId: 'cessationofoperation', reasonText: 'Cessation of Operation'},
                { reasonId: 'certificatehold', reasonText: 'Certificate Hold'},
                { reasonId: 'removefromcrl', reasonText: 'Remove from CRL'},
                { reasonId: 'privilegewithdrawn', reasonText: 'Privilege withdrawn'},
                { reasonId: 'aacompromise', reasonText: 'AA compromised'}
            ]
        };	
        return model;
    })
    
    /**
     * Model for showing Access Types
     */
    .factory('AccessTypeViewModel', function () {
        var model = {
            accessTypes: [
                { accessTypeId: 'confidential', accessTypeText: 'confidential'},
                { accessTypeId: 'public', accessTypeText: 'public'},
                { accessTypeId: 'bearer-only', accessTypeText: 'bearer-only'}
            ]
        };	
        return model;
    })

    ;

