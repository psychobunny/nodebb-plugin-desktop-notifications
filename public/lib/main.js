/*globals app, socket, config, ajaxify*/

(function() {
	"use strict";

	function requestPermission() {
		if (parseInt(app.user.uid, 10) === 0) {
			return;
		}

		
		if (localStorage.getItem('plugins:desktop_notifications.ignore') !== 'ignored') {
			require(['notify'], function(Notify) {
				if (!Notify.isSupported) {
					return;
				}

				app.alert({
					alert_id: 'desktop_notifications',
					title: '[[plugins:desktop_notifications.title]]',
					message: '[[plugins:desktop_notifications.message, ' + config.siteTitle + ']]',
					type: 'warning',
					timeout: 0,
					clickfn: function () {
						Notify.requestPermission(hideAlertBar, hideAlertBar);
					},
					closefn: function () {
						hideAlertBar();
						localStorage.setItem('plugins:desktop_notifications.ignore', 'ignored');
						app.alert({
							alert_id: 'desktop_notifications',
							title: '[[plugins:desktop_notifications.title]]',
							message: '[[plugins:desktop_notifications.ignored]]',
							type: 'info',
							timeout: 2500,
							clickfn: function () {
								ajaxify.go('user/' + app.user.userslug + '/settings');
							}
						});
					}
				});
			});
		}
	}

	function hideAlertBar() {
		$('#alert_button_desktop_notifications').remove();
		localStorage.setItem('plugins:desktop_notifications.ignore', 'ignored');
	}

	jQuery('document').ready(function() {
		var logo = $('.forum-logo').attr('src');

		requestPermission();

		$(window).on('action:ajaxify.end', function() {
			if (ajaxify.data.template.name === 'account/settings') {
				require(['translator', 'notify'], function(translator, Notify) {
					if (Notify.permissionLevel === 'granted' || Notify.permissionLevel === 'denied') {
						return;
					}

					translator.translate('<h4>Desktop Notifications</h4><div class="well"><button class="btn btn-default">Configure Desktop Notifications</button></div>', function(translated) {
						var well = $(translated);
						well.find('button').on('click', function() {
							localStorage.setItem('plugins:desktop_notifications.ignore', '');
							require(['notify'], function(Notify) {
								Notify.requestPermission();
							});
						});

						$('.account > .row > *:first-child').append(well);
					});
				});
			}
		});
		
		socket.on('event:plugin:desktop_notifications', function(data) {
			if (!data) {
				return;
			}
			var text = data.bodyShort || data.text;
			if (!text) {
				return;
			}
			require(['notify', 'translator'], function(Notify, translator) {
				function decodeEntities(encodedString) {
					var textArea = document.createElement('textarea');
					textArea.innerHTML = encodedString;
					return textArea.value;
				}
				translator.translate(text, function(translated) {
					var notification = new Notify(decodeEntities(config.siteTitle), {
						body: translated.replace(/<strong>/g, '').replace(/<\/strong>/g, ''),
						icon: logo,
						timeout: 5,
						notifyClick: function() {
							socket.emit('notifications.get', {nids: [data.nid]}, function(err, notifs) { 
								if (notifs.length) {
									ajaxify.go(notifs[0].path.substring(1));
								}
							});
							notification.close();
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
