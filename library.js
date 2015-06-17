(function(module) {
	"use strict";

	var Notifications = {},
		app;

	Notifications.onLoad = function(params, callback) {
		app = params.app;
		callback();
	};

	module.exports = Notifications;
}(module));