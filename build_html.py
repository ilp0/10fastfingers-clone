"""Transform the Wayback-archived page.html into a standalone index.html"""
import re

src = open('page.html', encoding='utf-8').read()

# 1) Strip the wayback toolbar block
src = re.sub(r'<!-- BEGIN WAYBACK TOOLBAR INSERT -->.*?<!-- END WAYBACK TOOLBAR INSERT -->',
             '', src, flags=re.S)

# 2) Strip all wayback URL prefixes (absolute + path-only)
src = re.sub(r'https?://web\.archive\.org/web/\d+[a-z_]*/', '', src)
src = re.sub(r'//web\.archive\.org/web/\d+[a-z_]*/', '', src)
src = re.sub(r'/web/\d+[a-z_]*/', '/', src)
# Strip cache-busters
src = re.sub(r'(\.(?:css|js|png|jpg|jpeg|gif|svg|webp))\?\d+', r'\1', src)
# Normalize 10fastfingers.com URLs to root-relative
src = src.replace('https://10fastfingers.com/', '/').replace('http://10fastfingers.com/', '/').replace('https://img.10fastfingers.com/', '/')

# 3) Kill wayback's own JS (archive_analytics, RufflePlayer, ruffle, __wm.init, wombat, athena, bundle-playback)
src = re.sub(r'<script[^>]*>[^<]*archive_analytics[^<]*</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*archive\.org[^>]*>[^<]*</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*archive\.org[^>]*/?>', '', src)
src = re.sub(r'<script[^>]*>\s*window\.RufflePlayer.*?</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*ruffle\.js[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*>\s*__wm\.init.*?</script>', '', src, flags=re.S)
src = re.sub(r'<link[^>]*(banner-styles|iconochive)\.css[^>]*/?>', '', src)
src = re.sub(r'<!-- End Wayback Rewrite JS Include -->', '', src)

# 4) Kill all tracking/ad scripts: gtag, GTM, Matomo, Cookiebot, adsense, freestar, umami, regional script
src = re.sub(r'<!-- Google tag \(gtag\.js\) -->.*?</script>\s*<script>.*?</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*googletagmanager[^>]*></script>', '', src)
src = re.sub(r'<script>\s*window\.dataLayer.*?</script>', '', src, flags=re.S)
src = re.sub(r'<!-- Matomo -->.*?<!-- End Matomo Code -->', '', src, flags=re.S)
src = re.sub(r'<script[^>]*Cookiebot[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*adsbygoogle[^>]*></script>', '', src)
src = re.sub(r'<link[^>]*cls\.css[^>]*/?>', '', src)
src = re.sub(r'<script[^>]*pubfig[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*>\s*var\s+freestar.*?</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*>\s*freestar\.config\.enabled_slots\.push.*?</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*>\s*window\.google_analytics_uacct.*?</script>', '', src, flags=re.S)
src = re.sub(r'<script[^>]*umami[^>]*></script>', '', src)
src = re.sub(r'<script type="text/javascript">\s*var region = Intl\.DateTimeFormat.*?</script>', '', src, flags=re.S)
src = re.sub(r'<div id="quickkeys"></div>', '', src)

# 5) Drop ad placeholder divs and Tag ID comments
src = re.sub(r'<div[^>]*data-freestar-ad[^>]*>.*?</div>', '', src, flags=re.S)
src = re.sub(r'<div[^>]*id="10FastFingers_[^"]*"[^>]*>.*?</div>', '', src, flags=re.S)
src = re.sub(r'<div style="margin-bottom: 20px;">\s*</div>', '', src)
src = re.sub(r'<!--[^>]*-->', lambda m: '' if any(k in m.group(0).lower() for k in ['tag id','adsense','cookiebot','matomo','place this section','cls','freestar','below is a link','the file is intended','to find out more','if you dont want','file archived','playback timings','wayback']) else m.group(0), src)

# 6) Strip patreon link (CDN'd image)
src = re.sub(r'<li>\s*<a[^>]*patreon[^>]*>.*?</a>\s*</li>', '', src, flags=re.S)

# 7) Replace asset references with local ones
src = re.sub(r'<link[^>]*href="[^"]*bootstrap[^"]*\.css[^"]*"[^>]*/?>', '', src)
src = re.sub(r'<link[^>]*href="[^"]*font-awesome[^"]*\.css[^"]*"[^>]*/?>', '', src)
src = re.sub(r'<link[^>]*?href="[^"]*css/style\.css[^"]*"[^>]*?>', '', src)
# Insert our own consolidated CSS block just before </head>
css_block = (
    '<link rel="stylesheet" href="vendor/bootstrap.min.css">\n'
    '<link rel="stylesheet" href="vendor/font-awesome.min.css">\n'
    '<link rel="stylesheet" href="css/style.css">\n'
)
src = src.replace('</head>', css_block + '</head>')

# Strip all script tags pointing at cdnjs/bootstrapcdn/jquery/lazyload/globalfunctions/speedtest
src = re.sub(r'<script[^>]*src="[^"]*jquery[^"]*"[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*lazyload[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*src="[^"]*bootstrap[^"]*\.js[^"]*"[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*src="[^"]*globalfunctions\.js[^"]*"[^>]*></script>', '', src)
src = re.sub(r'<script[^>]*src="[^"]*speedtest\.js[^"]*"[^>]*></script>', '', src)

# 8) Strip the trailing inline jQuery-ready script that fires AJAX to /speedtests/*
src = re.sub(r'<script type="text/javascript">\s*//<!\[CDATA\[\s*\$\(document\)\.ready\(function \(\) \{.*?//\]\]>\s*</script>',
             '', src, flags=re.S)

# 9) Strip recent-activity feed entirely (relied on external Facebook/Gravatar avatars)
src = re.sub(r'<div class="list-group" id="activity-module">.*?</pre>-->\s*</div>\s*</div>',
             '', src, flags=re.S, count=1)

# 10) Hash-route language switching (handle 0/1/2 leading slashes)
src = re.sub(r'href="/*switch-language/([a-z-]+)"', r'href="#lang=\1"', src)
src = re.sub(r'href="/*typing-test/([a-z-]+)"', r'href="#lang=\1"', src)
# Other dead links → "#"
src = re.sub(r'href="//?(forum|faq|supporter|login|impressum|cookie-policy|gdpr|translations|achievements|competitions|multiplayer|advanced-typing-test/[a-z-]+|text-practice/new|top1000|widgets/typingtest)"',
             r'href="#"', src)
# Catch double-slash residue on any href / src
src = re.sub(r'href="//+', 'href="', src)
src = re.sub(r'src="//+(?!/)', 'src="/', src)
# Fix navbar-brand (was /)
src = re.sub(r'<a class="navbar-brand" href="[^"]*"></a>',
             '<a class="navbar-brand" href="#" title="10FastFingers (offline replica)"></a>', src)

# 11) Inject vendor scripts + app.js at end of body
vendor_block = (
    '<script src="vendor/jquery.min.js"></script>\n'
    '<script src="vendor/bootstrap.min.js"></script>\n'
    '<script src="js/words.js"></script>\n'
    '<script src="js/globalfunctions.js"></script>\n'
    '<script src="js/speedtest.js"></script>\n'
    '<script src="js/app.js"></script>\n'
)
src = src.replace('</body>', vendor_block + '</body>')

# 12) Collapse runs of blank lines
src = re.sub(r'\n[ \t]*\n[ \t]*\n+', '\n\n', src)

open('index.html', 'w', encoding='utf-8').write(src)
print('index.html written:', len(src), 'chars')
