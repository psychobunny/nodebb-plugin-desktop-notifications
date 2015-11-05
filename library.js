(function(module) {
	"use strict";

	var notifications = {},
		app;

	notifications.pushed = function(params, callback) {
		var notification = params.notification,
			uids = params.uids;

		var socket = module.parent.require('./socket.io');

		uids.forEach(function(uid) {
			socket.in('uid_' + uid).emit('event:plugin:desktop_notifications', notification);
		});
	};

	module.exports = notifications;
}(module));
