"""Generate js/words.js from top-200 frequency lists in wl_*.txt"""

LANGS = {
	"sqi": ("Albanian", "Shqip", "albanian"),
	"ara": ("Arabic", "العربية", "arabic", "rtl"),
	"hye": ("Armenian", "հայերեն", "armenian"),
	"aze": ("Azerbaijani", "Azərbaycanca", "azerbaijani"),
	"ben": ("Bengali", "বাংলা", "bengali"),
	"bul": ("Bulgarian", "Български", "bulgarian"),
	"cat": ("Catalan", "Català", "catalan"),
	"zho": ("Chinese Simplified", "简体中文", "simplified-chinese"),
	"zh-tw": ("Chinese Traditional", "繁體中文", "traditional-chinese"),
	"hrv": ("Croatian", "Hrvatski", "croatian"),
	"ces": ("Czech", "Česky", "czech"),
	"dan": ("Danish", "Dansk", "danish"),
	"nld": ("Dutch", "Nederlands", "dutch"),
	"eng": ("English", "English", "english"),
	"epo": ("Esperanto", "Esperanto", "esperanto"),
	"est": ("Estonian", "Eesti", "estonian"),
	"fil": ("Filipino", "filipino", "filipino"),
	"fin": ("Finnish", "Suomi", "finnish"),
	"fra": ("French", "Français", "french"),
	"glg": ("Galician", "Galego", "galician"),
	"kat": ("Georgian", "ქართული ენა", "georgian"),
	"deu": ("German", "Deutsch", "german"),
	"ell": ("Greek", "Ελληνικά", "greek"),
	"heb": ("Hebrew", "עברית", "hebrew", "rtl"),
	"hin": ("Hindi", "हिन्दी", "hindi"),
	"hun": ("Hungarian", "Magyar", "hungarian"),
	"isl": ("Icelandic", "íslenska", "icelandic"),
	"ind": ("Indonesian", "Bahasa Indonesia", "indonesian"),
	"ita": ("Italian", "Italiano", "italian"),
	"jpn": ("Japanese", "日本語", "japanese"),
	"kor": ("Korean", "한국어", "korean"),
	"kur": ("Kurdish", "کوردی", "kurdish", "rtl"),
	"lav": ("Latvian", "latviešu valoda", "latvian"),
	"lit": ("Lithuanian", "Lietuvių", "lithuanian"),
	"mkd": ("Macedonian", "Makedonski", "macedonian"),
	"mlg": ("Malagasy", "Malagasy", "malagasy"),
	"msa": ("Malaysian", "Bahasa Melayu", "malaysian"),
	"nor": ("Norwegian", "Norsk", "norwegian"),
	"pus": ("Pashto", "پښتو", "pashto", "rtl"),
	"fas": ("Persian", "فارسی", "persian", "rtl"),
	"pol": ("Polish", "Polski", "polish"),
	"por": ("Portuguese", "Português", "portuguese"),
	"ron": ("Romanian", "Română", "romanian"),
	"rus": ("Russian", "Русский", "russian"),
	"srp": ("Serbian", "Српски / Srpski", "serbian"),
	"slk": ("Slovak", "Slovenčina", "slovak"),
	"slv": ("Slovenian", "Slovenščina", "slovenian"),
	"spa": ("Spanish", "Español", "spanish"),
	"swe": ("Swedish", "Svenska", "swedish"),
	"tha": ("Thai", "ภาษาไทย", "thai"),
	"tur": ("Turkish", "Türkçe", "turkish"),
	"ukr": ("Ukrainian", "українська", "ukrainian"),
	"urd": ("Urdu", "اُردُو", "urdu", "rtl"),
	"vie": ("Vietnamese", "Tiếng Việt", "vietnamese"),
}

# Map iso639_3 → 2-letter code used by hermitdave/FrequencyWords (where available)
FREQ_CODE = {
	"sqi": "sq", "ara": "ar", "hye": "hy", "aze": "az", "ben": "bn",
	"bul": "bg", "cat": "ca", "zho": "zh_cn", "zh-tw": "zh_tw",
	"hrv": "hr", "ces": "cs", "dan": "da", "nld": "nl", "eng": "en",
	"epo": "eo", "est": "et", "fil": "tl", "fin": "fi", "fra": "fr",
	"glg": "gl", "kat": "ka", "deu": "de", "ell": "el", "heb": "he",
	"hin": "hi", "hun": "hu", "isl": "is", "ind": "id", "ita": "it",
	"jpn": "ja", "kor": "ko", "kur": "ku", "lav": "lv", "lit": "lt",
	"mkd": "mk", "mlg": "mg", "msa": "ms", "nor": "no", "pus": "ps",
	"fas": "fa", "pol": "pl", "por": "pt", "ron": "ro", "rus": "ru",
	"srp": "sr", "slk": "sk", "slv": "sl", "spa": "es", "swe": "sv",
	"tha": "th", "tur": "tr", "ukr": "uk", "urd": "ur", "vie": "vi",
}

import urllib.request, sys, re

def fetch_top_words(code, limit=1000):
	url = f"https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/{code}/{code}_50k.txt"
	try:
		req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
		body = urllib.request.urlopen(req, timeout=20).read().decode('utf-8', 'replace')
	except Exception as e:
		print(f"  failed: {e}", file=sys.stderr)
		return []
	out = []
	seen = set()
	for line in body.splitlines():
		w = line.split()[0] if line.split() else ''
		if not w or len(w) < 2:
			continue
		# allow letters and apostrophes
		if not re.match(r'^[\w\'’\-]+$', w, re.UNICODE):
			continue
		if w.lower() in seen:
			continue
		seen.add(w.lower())
		out.append(w)
		if len(out) >= limit:
			break
	return out

# Fetch all
words_by_iso = {}
for iso, meta in LANGS.items():
	code = FREQ_CODE.get(iso)
	if not code:
		continue
	print(f"Fetching {iso}/{code}...", file=sys.stderr)
	ws = fetch_top_words(code)
	if ws:
		words_by_iso[iso] = ws
	else:
		print(f"  skipped {iso}", file=sys.stderr)

# Render words.js
out = []
out.append("// js/words.js — generated from hermitdave/FrequencyWords (CC BY-SA 4.0).")
out.append("// Each pool is the top-200 most frequent words of that language (apostrophes/hyphens kept).")
out.append("// speedtest.js shuffles this pool on every restart, matching the original engine.")
out.append("")
out.append("window.TenFastFingers = window.TenFastFingers || {};")
out.append("window.TenFastFingers.LANGS = {")
for iso, meta in LANGS.items():
	parts = [f"name: {meta[0]!r}", f"native: {meta[1]!r}", f"slug: {meta[2]!r}"]
	if len(meta) > 3:
		parts.append(f"dir: {meta[3]!r}")
	out.append("\t" + repr(iso) + ": { " + ", ".join(parts) + " },")
out.append("};")
out.append("")
out.append("window.TenFastFingers.SLUG_TO_ISO = (function () {")
out.append("\tvar m = {};")
out.append("\tfor (var k in window.TenFastFingers.LANGS) m[window.TenFastFingers.LANGS[k].slug] = k;")
out.append("\treturn m;")
out.append("})();")
out.append("")
def esc(w):
	return '"' + w.replace('\\', '\\\\').replace('"', '\\"') + '"'

out.append("window.TenFastFingers.WORDS = {};")
out.append("window.TenFastFingers.WORDS_1000 = {};")
for iso in sorted(words_by_iso):
	full = words_by_iso[iso]
	top200 = full[:200]
	top1000 = full  # may be ≤ 1000 for low-resource langs
	out.append(f"window.TenFastFingers.WORDS[{iso!r}] = [" + ",".join(esc(w) for w in top200) + "];")
	out.append(f"window.TenFastFingers.WORDS_1000[{iso!r}] = [" + ",".join(esc(w) for w in top1000) + "];")

open('js/words.js', 'w', encoding='utf-8').write("\n".join(out) + "\n")
print(f"\nDone: {len(words_by_iso)} languages, {sum(len(v) for v in words_by_iso.values())} words total", file=sys.stderr)
