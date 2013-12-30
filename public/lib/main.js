(function() {
	"use strict";

	function requestPermission() {
		require(['notify'], function(Notify) {
			(new Notify('NodeBB')).requestPermission();
		});
	}

	jQuery('document').ready(function() {
		var logo = $('.forum-logo').attr('src');

		requestPermission();

		jQuery('#notif_dropdown').on('click', function() {
			requestPermission();
		});

		jQuery('*').on('click', function() {
			requestPermission();
		});
		
		socket.on('event:new_notification', function(data) {
			if (data.text) {
				require(['notify'], function(Notify) {
					var notification = new Notify('NodeBB', {
						body: data.text.replace(/<strong>/g, '').replace(/<\/strong>/g, ''),
						icon: logo,
						notifyClick: function() {
							ajaxify.go(data.path.substring(1));
						}
					});
				});

				notification.show();
			}
		});
	});
}());