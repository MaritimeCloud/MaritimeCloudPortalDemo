webpackJsonpac__name_([3],{

/***/ "./src/app/pages/org-identity-registry/components/org-devices/org-devices.component.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var OrgDevicesComponent = (function () {
    function OrgDevicesComponent() {
    }
    OrgDevicesComponent = __decorate([
        core_1.Component({
            selector: 'org-devices',
            encapsulation: core_1.ViewEncapsulation.None,
            template: __webpack_require__("./src/app/pages/org-identity-registry/components/org-devices/org-devices.html"),
            styles: []
        }), 
        __metadata('design:paramtypes', [])
    ], OrgDevicesComponent);
    return OrgDevicesComponent;
}());
exports.OrgDevicesComponent = OrgDevicesComponent;


/***/ },

/***/ "./src/app/pages/org-identity-registry/components/org-devices/org-devices.html":
/***/ function(module, exports) {

module.exports = "<div class=\"row\">\r\n  <div class=\"col-md-12\">\r\n    Devices\r\n  </div>\r\n</div>\r\n"

/***/ },

/***/ "./src/app/pages/org-identity-registry/components/org-services/org-services.component.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var OrgServicesComponent = (function () {
    function OrgServicesComponent() {
    }
    OrgServicesComponent = __decorate([
        core_1.Component({
            selector: 'org-services',
            encapsulation: core_1.ViewEncapsulation.None,
            template: __webpack_require__("./src/app/pages/org-identity-registry/components/org-services/org-services.html"),
            styles: []
        }), 
        __metadata('design:paramtypes', [])
    ], OrgServicesComponent);
    return OrgServicesComponent;
}());
exports.OrgServicesComponent = OrgServicesComponent;


/***/ },

/***/ "./src/app/pages/org-identity-registry/components/org-services/org-services.html":
/***/ function(module, exports) {

module.exports = "<div class=\"row\">\r\n  <div class=\"col-md-12\">\r\n    Services\r\n  </div>\r\n</div>\r\n"

/***/ },

/***/ "./src/app/pages/org-identity-registry/org-identity-registry.component.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var OrgIdentityRegistryComponent = (function () {
    function OrgIdentityRegistryComponent() {
    }
    OrgIdentityRegistryComponent = __decorate([
        core_1.Component({
            selector: 'org-identity-registry',
            template: "<router-outlet></router-outlet>"
        }), 
        __metadata('design:paramtypes', [])
    ], OrgIdentityRegistryComponent);
    return OrgIdentityRegistryComponent;
}());
exports.OrgIdentityRegistryComponent = OrgIdentityRegistryComponent;


/***/ },

/***/ "./src/app/pages/org-identity-registry/org-identity-registry.module.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var core_1 = __webpack_require__("./node_modules/@angular/core/index.js");
var common_1 = __webpack_require__("./node_modules/@angular/common/index.js");
var nga_module_1 = __webpack_require__("./src/app/theme/nga.module.ts");
var org_identity_registry_routing_1 = __webpack_require__("./src/app/pages/org-identity-registry/org-identity-registry.routing.ts");
var org_identity_registry_component_1 = __webpack_require__("./src/app/pages/org-identity-registry/org-identity-registry.component.ts");
var org_devices_component_1 = __webpack_require__("./src/app/pages/org-identity-registry/components/org-devices/org-devices.component.ts");
var org_services_component_1 = __webpack_require__("./src/app/pages/org-identity-registry/components/org-services/org-services.component.ts");
var OrgIdentityRegistryModule = (function () {
    function OrgIdentityRegistryModule() {
    }
    OrgIdentityRegistryModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                nga_module_1.NgaModule,
                org_identity_registry_routing_1.routing
            ],
            declarations: [
                org_identity_registry_component_1.OrgIdentityRegistryComponent,
                org_devices_component_1.OrgDevicesComponent,
                org_services_component_1.OrgServicesComponent
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], OrgIdentityRegistryModule);
    return OrgIdentityRegistryModule;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrgIdentityRegistryModule;


/***/ },

/***/ "./src/app/pages/org-identity-registry/org-identity-registry.routing.ts":
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var router_1 = __webpack_require__("./node_modules/@angular/router/index.js");
var org_identity_registry_component_1 = __webpack_require__("./src/app/pages/org-identity-registry/org-identity-registry.component.ts");
var org_devices_component_1 = __webpack_require__("./src/app/pages/org-identity-registry/components/org-devices/org-devices.component.ts");
var org_services_component_1 = __webpack_require__("./src/app/pages/org-identity-registry/components/org-services/org-services.component.ts");
// noinspection TypeScriptValidateTypes
var routes = [
    {
        path: '',
        component: org_identity_registry_component_1.OrgIdentityRegistryComponent,
        children: [
            { path: 'devices', component: org_devices_component_1.OrgDevicesComponent },
            { path: 'services', component: org_services_component_1.OrgServicesComponent }
        ]
    }
];
exports.routing = router_1.RouterModule.forChild(routes);


/***/ }

});
//# sourceMappingURL=3.map