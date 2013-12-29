(function(module) {
	"use strict";

	var Notifications = {}

	Notifications.addScripts = function(scripts, callback) {
		return scripts.concat([
				'plugins/nodebb-plugin-desktop-notifications/vendor/notify/notify.js',
				'plugins/nodebb-plugin-desktop-notifications/lib/main.js'
			]);
	};

	module.exports = Notifications;
}(module));