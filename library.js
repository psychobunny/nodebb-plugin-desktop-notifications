"use strict";

var notifications = module.exports;
var app;

notifications.pushed = function(params, callback) {
	var notification = params.notification;
	var uids = params.uids;

	var socket = require.main.require('./src/socket.io');

	uids.forEach(function(uid) {
		socket.in('uid_' + uid).emit('event:plugin:desktop_notifications', notification);
	});
};
