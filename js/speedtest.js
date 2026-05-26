// speedtest.js — standalone adaptation of the original 10fastfingers.com speedtest engine.
// Original logic preserved 1:1; only the network calls to /speedtests/get_words and
// /speedtests/auswertung are replaced with local equivalents.

var word_string, words;
var row1_string = "";
var i;
var word_pointer = 0;
var user_input_stream = "";
var countdown;
var row_counter = 0;
var eingabe;
var start_time = 0;
var end_time = 0;
var setval = "";
var line_height = 0;
var loading = 0;
var cd_started = 0;
var previous_position_top = 0;

var error_wpm = 0;
var error_keystrokes = 0;
var error_correct = 0;
var error_wrong = 0;
var correction_counter = 0;

var test_ausgefuehrt = 0;
var selected = 0;
var pre_inputvalue = "";
var inputvalue = "";

var keys = {};

var input_key_value = $("#config_input_key").attr("value");
var $inputfield = $("input#inputfield");
var $row1 = $("#row1");
var $reloadBtn = $("#reload-btn");
var $row1_span_wordnr;

var afk_timer = 0;

$(document).ready(function () {
	restart();
	activate_keylistener();

	$(document).keydown(function (event) {
		if (event.which == 116 && loading == 0) {
			loading = 1;
			restart();
			return false;
		}
		keys[event.which] = true;
	});

	$(document).keyup(function (event) {
		delete keys[event.which];
	});

	$("#reload-btn").on("click", function () {
		restart();
		return false;
	});
});

function get_local_wordlist() {
	// Local replacement for POST /speedtests/get_words.
	// TenFastFingers.WORDS is populated by js/words.js (or by app.js when the language switches).
	var lang = ($("#iso_639_3").text() || "fin").trim();
	var pool = (window.TenFastFingers && window.TenFastFingers.WORDS && window.TenFastFingers.WORDS[lang])
		|| (window.TenFastFingers && window.TenFastFingers.WORDS && window.TenFastFingers.WORDS.eng)
		|| [];
	if (!pool.length) return "";
	// Build a shuffled list of ~310 words (the original API returns enough words
	// to fill the 60-second window for very fast typists).
	var out = [];
	var TARGET = 310;
	while (out.length < TARGET) {
		var copy = pool.slice();
		// Fisher–Yates shuffle
		for (var j = copy.length - 1; j > 0; j--) {
			var k = Math.floor(Math.random() * (j + 1));
			var t = copy[j]; copy[j] = copy[k]; copy[k] = t;
		}
		out = out.concat(copy);
	}
	return out.slice(0, TARGET).join("|");
}

function restart() {
	word_string = "";
	words = "";
	row1_string = "";
	word_pointer = 0;
	user_input_stream = "";
	countdown = 60;
	cd_started = 0;
	previous_position_top = 0;
	row_counter = 0;
	eingabe = "";
	start_time = 0;
	end_time = 0;

	error_wpm = 0;
	error_keystrokes = 0;
	error_correct = 0;
	error_wrong = 0;
	correction_counter = 0;

	selected = 0;
	pre_inputvalue = "";
	inputvalue = "";

	$("#timer").text("1:00");
	$("#ajax-load").css("display", "block");
	$("#reload-box").css("display", "none");
	$("#row1").css("top", "1px");
	$("#timer").removeClass("off");

	$("#auswertung-result").hide().html("");
	$("#badge-box").hide().html("");
	$("#error-box").hide();

	window.clearInterval(setval);
	setval = "";

	// Local replacement for AJAX call. Use a small async delay so layout flushes match original timing.
	setTimeout(function () {
		var data = get_local_wordlist();
		$("#ajax-load").css("display", "none");
		$("#reload-box").css("display", "block");
		$("#wordlist").text(data);

		word_string = $("#wordlist").text();
		words = word_string.split("|");

		fill_line_switcher();

		$('#row1 span[wordnr="' + word_pointer + '"]').position();
		previous_position_top = 0;
		line_height = parseInt(
			$('#row1 span[wordnr="' + word_pointer + '"]').css("line-height")
		);

		$inputfield.val("");
		$inputfield.focus();
		$("#row1").show();
		$("#words").fadeTo("fast", 1.0);
		test_ausgefuehrt++;
		loading = 0;
	}, 120);
}

function activate_keylistener() {
	var android_spacebar = 0;

	$(window).on("touchstart", function () {
		$("input#inputfield").on("input", function () {
			var value = $("input#inputfield").val();
			android_spacebar = (value.indexOf(" ") != -1) ? 1 : 0;
		});
	});

	$inputfield.keydown(selectionCheck);

	$inputfield.keyup(function (event) {
		if (loading == 0) start_countdown();

		if (pre_inputvalue === "" && inputvalue === "")
			inputvalue = $inputfield.val();
		else {
			pre_inputvalue = inputvalue;
			inputvalue = $inputfield.val();
		}

		afk_timer = 0;
		$reloadBtn.show();

		$row1_span_wordnr = $('#row1 span[wordnr="' + word_pointer + '"]');

		var keyid = event.which;
		switch (keyid) {
			case 8:
				correction_counter += compare();
				break;
			case 46:
				correction_counter += compare();
				break;
			default:
				break;
		}
		if (selected && keyid !== 8 && keyid !== 46 && pre_inputvalue !== inputvalue) {
			correction_counter += compare() + 1;
		}

		if (event.which == input_key_value && $inputfield.val() == " ") {
			$inputfield.val("");
		} else if ((event.which == input_key_value && loading == 0) || android_spacebar == 1) {
			var eingabe = $inputfield.val().split(" ");
			user_input_stream += eingabe[0] + " ";

			$row1_span_wordnr.removeClass("highlight-wrong");

			if (eingabe[0] == words[word_pointer]) {
				$row1_span_wordnr.removeClass("highlight").addClass("correct");
				error_correct++;
				error_keystrokes += words[word_pointer].length;
				error_keystrokes++;
			} else {
				$row1_span_wordnr.removeClass("highlight").addClass("wrong");
				error_wrong++;
				error_keystrokes -= Math.round(words[word_pointer].length / 2);
			}

			word_pointer++;
			$row1_span_wordnr = $('#row1 span[wordnr="' + word_pointer + '"]');
			$row1_span_wordnr.addClass("highlight");

			var p = $row1_span_wordnr.position();

			if (p && p.top > previous_position_top + 10) {
				row_counter++;
				previous_position_top = p.top;
				var zeilensprung_hoehe = -1 * line_height * row_counter;
				$row1.css("top", zeilensprung_hoehe + "px");
				$row1_span_wordnr.addClass("highlight");
			}

			$("#inputstream").text(user_input_stream);
			$inputfield.val(eingabe[1] || "");
		} else {
			if ($inputfield.val().split(" ")[0] == words[word_pointer].substr(0, $inputfield.val().length))
				$row1_span_wordnr.removeClass("highlight-wrong").addClass("highlight");
			else
				$row1_span_wordnr.removeClass("highlight").addClass("highlight-wrong");
		}
	});
}

function compare() {
	return pre_inputvalue.length - inputvalue.length;
}

function selectionCheck(event) {
	selected = event.target.selectionEnd - event.target.selectionStart;
}

function start_countdown() {
	if (cd_started == 0) {
		cd_started = 1;
		setval = window.setInterval(count_down, 1000);
		start_time = get_current_time();
	}
}

function count_down() {
	countdown--;
	afk_timer++;

	if (countdown > 9) {
		$("#timer").text("0:" + countdown);
	} else if (countdown > 0) {
		$("#timer").text("0:0" + countdown);
	} else {
		$("#timer").text("0:00");
		$("#timer").addClass("off");
		$("#row1").hide();
		$("#words").fadeOut();

		window.clearInterval(setval);
		setval = "";

		end_time = get_current_time();
		render_local_result();
	}
}

function render_local_result() {
	// Local replacement for POST /speedtests/auswertung.
	// Compute results the same way the original server did, then inject the same HTML
	// the server returned (matches the #result-table / #auswertung-result CSS).
	var duration_sec = Math.max(1, Math.round((end_time - start_time) / 1000));
	var tokens = user_input_stream.split(" ").filter(function (w) { return w.length > 0; });
	var correct = 0, wrong = 0, keystrokes_correct = 0, keystrokes_wrong = 0;
	for (var i = 0; i < tokens.length; i++) {
		if (words[i] !== undefined && tokens[i] === words[i]) {
			correct++;
			keystrokes_correct += words[i].length + 1; // +1 for space
		} else if (words[i] !== undefined) {
			wrong++;
			keystrokes_wrong += (tokens[i] ? tokens[i].length : 0) + 1;
		}
	}
	var keystrokes_total = keystrokes_correct + keystrokes_wrong;
	// 10FastFingers WPM = correct characters / 5, scaled to one minute.
	var wpm = Math.round((keystrokes_correct / 5) * (60 / duration_sec));
	var cpm = Math.round(keystrokes_correct * (60 / duration_sec));
	var accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 1000) / 10 : 0;

	$("#result-load-indicator").hide();

	var html =
		'<h3>Tulos <a href="#" onclick="return false;">jaa tulos</a></h3>' +
		'<table id="result-table" style="width:100%;">' +
		'<tr><td class="name">Sanat/min (WPM)</td><td class="value" id="wpm"><strong>' + wpm + '</strong> <small>WPM</small></td></tr>' +
		'<tr id="keystrokes"><td class="name">Näppäilyt</td><td class="value"><small>(' + keystrokes_correct + ' | ' + keystrokes_wrong + ')</small> <strong>' + keystrokes_total + '</strong></td></tr>' +
		'<tr id="correct"><td class="name">Oikeat sanat</td><td class="value"><strong>' + correct + '</strong></td></tr>' +
		'<tr id="wrong"><td class="name">Väärät sanat</td><td class="value"><strong>' + wrong + '</strong></td></tr>' +
		'<tr><td class="name">Tarkkuus</td><td class="value"><strong>' + accuracy + '%</strong></td></tr>' +
		'</table>' +
		'<p id="textresult">Kirjoitit <strong>' + wpm + ' WPM</strong> (' + cpm + ' CPM).</p>';

	$("#auswertung-result").html(html).show();
}

function get_current_time() {
	return new Date().getTime();
}

function trim11(str) {
	str = str.replace(/^\s+/, "");
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}

function fill_line_switcher() {
	row1_string = "";
	for (i = 0; i < words.length; i++)
		row1_string += '<span wordnr="' + i + '" class="">' + words[i] + "</span> ";
	$("#row1").html(row1_string);
	$("#row1 span:first").addClass("highlight");
}
