/*globals app, user, socket, translator, config, ajaxify, templates*/

(function() {
	"use strict";

	var notifications = {
		ignore: false,
		originalPadding: 0
	};

	function requestPermission() {
		if (parseInt(app.user.uid, 10) === 0) {
			return;
		}

		function hideAlertBar() {
			notifications.ignore = true;
			$('.desktop-notification-permission').hide();
			if (notifications.originalPadding) {
				$('body').css('padding-top', notifications.originalPadding + 'px');
			}
		}

		require(['notify', 'components'], function(Notify, components) {
			function request() {
				Notify.requestPermission(hideAlertBar, hideAlertBar);
			}

			if (!notifications.ignore && Notify.permissionLevel !== 'granted') {
				templates.parse('partials/nodebb-plugin-desktop-notifications/alert-bar', {siteTitle: config.siteTitle}, function(tpl) {
					components.get('navbar').prepend($(tpl));

					notifications.originalPadding = parseInt($('body').css('padding-top'), 10);

					$('body').css('padding-top', notifications.originalPadding + parseInt($('.desktop-notification-permission').outerHeight()) + 'px');

					$('.desktop-notification-permission').on('click touchstart', function() {
						request();
					});

					$('.deactivate-notifications').on('click touchstart', hideAlertBar);
				});
			}
		});
	}

	jQuery('document').ready(function() {
		var logo = $('.forum-logo').attr('src');

		requestPermission();
		
		socket.on('event:new_notification', function(data) {
			if (!data) {
				return;
			}
			var text = data.bodyShort || data.text;
			if (!text) {
				return;
			}
			translator.translate(text, function(translated) {
				require(['notify'], function(Notify) {
					var notification = new Notify(config.siteTitle, {
						body: translated.replace(/<strong>/g, '').replace(/<\/strong>/g, ''),
						icon: logo,
						timeout: 5,
						notifyClick: function() {
							if (data.path) {
								ajaxify.go(data.path.substring(1));
							}
						}
					});
					notification.show();

					
					if (data.tid) {
						$(window).on('action:ajaxify.start', removeNotif);
						setTimeout(function() {
							$(window).off('action:ajaxify.start', removeNotif);
						}, 5000);
					}

					function removeNotif(ev, ajx) {
						var tid = ajx.url.match(/topic\/([\d+])/);

						if (tid) {
							if (parseInt(data.tid, 10) === parseInt(tid[1], 10)) {
								notification.close();
							}
						}
					}
				});
			});
		});
	});
}());
