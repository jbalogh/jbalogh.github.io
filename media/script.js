/** Google Analytics **/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-12894354-1']);
_gaq.push(['_trackPageview']);

var makeScript = function(src) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = src;
    document.body.appendChild(s);
};

var src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
makeScript(src);

var _gauges = _gauges || [];
(function() {
    var t   = document.createElement('script');
    t.type  = 'text/javascript';
    t.async = true;
    t.id    = 'gauges-tracker';
    t.setAttribute('data-site-id', '4f28c0d8cb25bc1e7100004d');
    t.src = '//secure.gaug.es/track.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(t, s);
})();
