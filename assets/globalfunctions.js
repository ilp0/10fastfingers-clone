var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
var live_user_update_interval;
var testwert;

function load_notifications() {
	function get_notification_type_sign(notification_type_id) {
		switch (notification_type_id) {
			case 1:
				return '<i class="icon-exclamation-sign"></i> ';
			case 2:
				return '<i class="icon-star"></i> ';

			default:
				return "";
		}
	}

	$.ajax({
		type: "POST",
		url: "/notifications/getNotifications",
		dataType: "json",
		cache: false,
		success: function (data) {
			$("#notification-modal .modal-body").html(data["notifications"]);

			if (data["unread_notifications"] > 0) {
				$(".notification-counter").text(data["unread_notifications"]);
			}
		},
	});
}

$("#notification-modal").on("shown.bs.modal", function (e) {
	$.ajax({
		type: "POST",
		url: "/notifications/mark_as_read",
		cache: false,
		success: function (data) {
			$(".notification-counter").text("");
		},
	});
});

$.fn.myLazyLoad = function () {
	this.lazyload({
		effect: "fadeIn",
	});
};

function get_live_users() {
	// $.ajax({
	// 	url: "/php/users_online.php",
	// 	data: {},
	// 	type: "get",
	// 	success: function (output) {
	// 		//console.log(output);
	// 		if (jQuery.isNumeric(output)) $("span#user-online").text(output);
	// 		else console.log("Error: " + output);
	// 	},
	// });
}

function liveUserUpdateTimer(step) {
	testwert = parseFloat(testwert) + parseFloat(step);
	$("span#user-online").text(parseInt(testwert));
}

$(function () {
	$("body").tooltip({
		selector: "[rel=tooltip]",
	});

	$("body").popover({
		selector: "[rel=popover]",
		template:
			'<div class="popover"><div class="arrow"></div><div class="popover-inner" style="width: 360px;"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>',
	});

	$("img.lazy").myLazyLoad();

	// live users refresh deactivated
	//setInterval(function(){ get_live_users(); }, 60000);

	//show the currently selected language
	var iso_639_3 = $("div#iso_639_3").text();

	if (/^[a-zA-Z-]+$/.test(iso_639_3)) {
		$("#selected-language").html(
			$("#lang-selector a[iso_639_3=" + iso_639_3 + "] > strong").text()
		);
	}

	//this modifies the fill-height of the sidebar
	var position = $(".sidebar-max-height").offset();
	$(".sidebar-max-height").height(400);
});

}

/*
     FILE ARCHIVED ON 12:23:11 Feb 19, 2025 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 21:11:31 May 26, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.662
  exclusion.robots: 0.072
  exclusion.robots.policy: 0.061
  esindex: 0.008
  cdx.remote: 19.858
  LoadShardBlock: 70.652 (3)
  PetaboxLoader3.datanode: 2883.459 (5)
  PetaboxLoader3.resolve: 214.621 (4)
  load_resource: 3035.95 (2)
*/