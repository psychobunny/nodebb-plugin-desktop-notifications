(function(module) {
	"use strict";

	var notifications = {},
		app;

	notifications.pushed = function(params, callback) {
		var notification = params.notification,
			uids = params.uids;

		var socket = module.parent.require('./socket.io'),
			rooms = module.parent.require('./socket.io/rooms');

		uids.forEach(function(uid) {
			var id = rooms.clients('uid_' + uid)[0];
			socket.in(id).emit('event:plugin:desktop_notifications', notification);
		});
	};

	module.exports = notifications;
}(module));