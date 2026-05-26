// app.js — standalone-build controller for the 10FastFingers replica.
// Wires the language dropdown, the "switch typing test language" toggle, the timer-hide,
// and the Normal/Advanced (top-1000) mode toggle.

(function () {
	$(function () {
		$("#switch-typing-test-language").on("click", function (e) {
			e.preventDefault();
			$("#language-list").slideToggle();
		});

		$("#inputfield").attr("dir", $("#typing-direction").attr("value") || "ltr");

		$("#timer").on("click", function () {
			$(this).toggleClass("hide-time");
		});

		// ---------------- hash-routed language + mode switching ----------------
		// Accepted forms: #lang=fin , #lang=finnish , #mode=advanced , #lang=fin&mode=advanced .
		function parseHash() {
			var out = {};
			(location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) {
				var m = kv.match(/^([a-z_]+)=([a-z0-9-]+)$/i);
				if (m) out[m[1].toLowerCase()] = m[2].toLowerCase();
			});
			return out;
		}

		function setLanguage(iso, opts) {
			var meta = window.TenFastFingers.LANGS[iso];
			if (!meta) return;
			$("#iso_639_3").text(iso);
			$("#selected-language").text(meta.name);
			// Replace the leading text node of the green switch button (preserves the caret span)
			$("#switch-typing-test-language").contents().filter(function () {
				return this.nodeType === 3;
			}).first().replaceWith(meta.name + " ");

			var dir = meta.dir || "ltr";
			$("#typing-direction").attr("value", dir);
			$("#inputfield").attr("dir", dir);

			document.title = "Kirjoitustesti " + meta.name + " - 10FastFingers.com";

			var mode = $("#speedtest_mode").attr("value");
			var pool_root = (mode === "advanced") ? window.TenFastFingers.WORDS_1000 : window.TenFastFingers.WORDS;
			if (!pool_root[iso]) {
				$("#warning").html('<div class="alert alert-warning" style="margin-bottom:10px;">' +
					'Word list for <strong>' + meta.name + '</strong> is not bundled in this offline build.' +
					' Falling back to English.</div>');
			} else {
				$("#warning").html("");
			}

			if (!opts || !opts.silent) restartTest();
		}

		function setMode(mode) {
			$("#speedtest_mode").attr("value", mode === "advanced" ? "advanced" : "");
			// Toggle sidebar active state
			$(".sidebar a[mode='speedtest'], .sidebar a[mode='advanced-speedtest']").removeClass("active");
			if (mode === "advanced") {
				$(".sidebar a[mode='advanced-speedtest']").addClass("active");
			} else {
				$(".sidebar a[mode='speedtest']").addClass("active");
			}
			// Update the small "Top NN sanaa" copy on the active sidebar item: keep as the design intends
			restartTest();
		}

		function restartTest() {
			if (typeof restart === "function") {
				loading = 1;
				restart();
			}
		}

		function applyHash() {
			var p = parseHash();
			var iso = null;
			if (p.lang) {
				iso = window.TenFastFingers.LANGS[p.lang] ? p.lang : window.TenFastFingers.SLUG_TO_ISO[p.lang] || null;
			}
			var mode = (p.mode === "advanced") ? "advanced" : "";

			// Apply mode first (without restarting), then language (which triggers a single restart)
			$("#speedtest_mode").attr("value", mode);
			$(".sidebar a[mode='speedtest'], .sidebar a[mode='advanced-speedtest']").removeClass("active");
			$(".sidebar a[mode='" + (mode === "advanced" ? "advanced-speedtest" : "speedtest") + "']").addClass("active");

			if (iso) setLanguage(iso);
			else restartTest();
		}

		$(window).on("hashchange", applyHash);

		$(document).on("click", "a[href^='#lang='], a[href^='#mode='], a[href^='#advanced=']", function (e) {
			e.preventDefault();
			location.hash = $(this).attr("href").replace(/^#/, "");
		});

		// Click on the sidebar "Kirjoitustesti (edistynyt)" → advanced mode
		$(".sidebar a[mode='advanced-speedtest']").attr("href", "#mode=advanced");
		$(".sidebar a[mode='speedtest']").attr("href", "#mode=");

		applyHash();
	});
})();
