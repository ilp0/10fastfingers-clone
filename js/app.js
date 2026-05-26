// app.js — standalone-build controller for the 10FastFingers replica.
// Wires the language dropdown, the "switch typing test language" toggle, and the timer-hide.

(function () {
	$(function () {
		// Toggle the language list below the test area
		$("#switch-typing-test-language").on("click", function (e) {
			e.preventDefault();
			$("#language-list").slideToggle();
		});

		// dir attribute (used by RTL languages)
		$("#inputfield").attr("dir", $("#typing-direction").attr("value") || "ltr");

		// Click on the timer toggles visibility (matches the original)
		$("#timer").on("click", function () {
			$(this).toggleClass("hide-time");
		});

		// Hash-routed language switching (#lang=<iso639_3 OR slug>)
		function applyLangFromHash() {
			var m = (location.hash || "").match(/lang=([a-z-]+)/i);
			if (!m) return false;
			var token = m[1].toLowerCase();
			var langs = window.TenFastFingers.LANGS;
			var iso = langs[token] ? token : (window.TenFastFingers.SLUG_TO_ISO[token] || null);
			if (!iso) return false;
			setLanguage(iso);
			return true;
		}

		function setLanguage(iso) {
			var meta = window.TenFastFingers.LANGS[iso];
			if (!meta) return;

			$("#iso_639_3").text(iso);
			// Update language name on the active sidebar item + switch button
			$("#selected-language").text(meta.name);
			$("#switch-typing-test-language").contents().filter(function () {
				return this.nodeType === 3;
			}).first().replaceWith(meta.name + " ");

			// Update direction (LTR/RTL)
			var dir = meta.dir || "ltr";
			$("#typing-direction").attr("value", dir);
			$("#inputfield").attr("dir", dir);

			// Update document title
			document.title = "Kirjoitustesti " + meta.name + " - 10FastFingers.com";

			// If we don't have a word pool for this language yet, surface a friendly notice.
			if (!window.TenFastFingers.WORDS[iso]) {
				$("#warning").html('<div class="alert alert-warning" style="margin-bottom:10px;">' +
					'Word list for <strong>' + meta.name + '</strong> is not bundled in this offline build.' +
					' Falling back to English.</div>');
			} else {
				$("#warning").html("");
			}

			// Reload the test with the new pool
			if (typeof restart === "function") {
				loading = 1;
				restart();
			}
		}

		$(window).on("hashchange", applyLangFromHash);

		// Hijack any in-page lang link
		$(document).on("click", "a[href^='#lang=']", function (e) {
			e.preventDefault();
			location.hash = $(this).attr("href").replace(/^#/, "");
		});

		// Apply initial hash if present
		applyLangFromHash();
	});
})();
