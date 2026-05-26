// globalfunctions.js — adapted from the wayback-archived 10fastfingers.com original.
// All AJAX endpoints have been stubbed out for the standalone build.

var live_user_update_interval;
var testwert;

function load_notifications() {
	// no-op in standalone build
}

$.fn.myLazyLoad = function () {
	// jQuery.lazyload is no longer bundled; show images immediately
	this.each(function () { this.src = this.src || $(this).attr('data-src'); });
};

function get_live_users() {}

function liveUserUpdateTimer(step) {
	testwert = parseFloat(testwert) + parseFloat(step);
	$("span#user-online").text(parseInt(testwert));
}

$(function () {
	$("body").tooltip({ selector: "[rel=tooltip]" });
	$("body").popover({
		selector: "[rel=popover]",
		template:
			'<div class="popover"><div class="arrow"></div><div class="popover-inner" style="width: 360px;"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>',
	});

	$("img.lazy").myLazyLoad();

	var iso_639_3 = $("div#iso_639_3").text();
	if (/^[a-zA-Z-]+$/.test(iso_639_3)) {
		var lbl = $("#lang-selector a[iso_639_3=" + iso_639_3 + "] > strong").text();
		if (lbl) $("#selected-language").html(lbl);
	}

	$(".sidebar-max-height").height(400);
});
