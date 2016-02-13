'use strict';

var debug = require("debug")("view-helpers");
var Handlebars = require('hbs');

debug("Handlebars object " + Handlebars.registerHelper);

module.exports = function () {
    Handlebars.registerHelper('statusPanelClass', function (status) {
        return new Handlebars.SafeString(classes[status].panelClass);
    });
    Handlebars.registerHelper('statusIconClass', function (status) {
        return new Handlebars.SafeString(classes[status].iconClass);
    });
};

//# sourceMappingURL=view-helpers-compiled.js.map