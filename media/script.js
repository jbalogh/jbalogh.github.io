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


/** Github projects **/
var names = ['zamboni', 'django-nose', 'django-cache-machine',
             'jingo', 'schematic', 'check', 'push'];
var project_el = document.querySelector('#projects');
if (project_el) {
    var github = 'http://github.com/api/v1/json/jbalogh/';
    var projects = {};

    var loadProjects = function(json) {
        var repos = json.user.repositories;
        for (var i in repos) {
            repo = repos[i];
            projects[repo.name] = repo;
        }
        dts = [];
        for (var i in names) {
            var name = names[i],
                p = projects[name],
                dt = '<dt><a href="' + p.url + '">' + name + '</a></dt>';
            dts.push(dt + '<dd>' + p.description + '</dd>');
        }
        project_el.innerHTML += '<dl>' + dts.join('') + '</dl>';
    };
    makeScript(github + '?callback=loadProjects');
}
