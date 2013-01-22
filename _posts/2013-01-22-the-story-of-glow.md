---
title: The Story of Glow
layout: post
tags: [mozilla]
---

One of the most fun projects I worked on at Mozilla was
[glow.mozilla.org][glow]. It was a couple weeks before the launch of Firefox 4
and my frontend buddy [@potch][] and I decided we should make a map to track
downloads in real-time.  This was back when Firefox releases were a big deal.
It turned out to be a really compelling visual. We saw a bunch of tweets about
people loving the map, it was featured in [Flowing Data][] and nytimes.com, and
somebody even made a [video][] about it.

Potch started working on the frontend map with SVG and canvas while I figured
out how to serve the download data; we would meet in the middle. We didn't have
much experience with node.js and didn't know what kind of traffic we'd see, so
I decided to play it safe and use static json data files for a near-real-time
experience. Each minute of downloads was stored in a separate file in a
predictable location. When the page loaded it looked for the data file two
minutes before the current time, since we knew (hoped) that it would be written
and ready to serve.

Our script loaded the record of the downloads and started dropping dots on the
world map wherever the download came from (according to IP addresses). No one
knew the data was two minutes old and our web servers were pretty good at
serving static files.

The download data was already flowing into HBase (set up by someone else), so I
wrote a Python script that connected to HBase every minute and retrieved the
latest data. I massaged it into a structure easier for the js to consume and
wrote it all out to a per-minute json file. That script ran on a cron job since
we like old reliable technology.

The dots were animated on a transparent canvas overlaid on the SVG world map.
We had a lot of trouble making the animation performant since we were working
with old browsers, Firefox 3.6 and Chrome 10. Everything worked, but it was
super slow.

The Sunday before the release, I curled up with the Chrome profiler and
optimized the script. The original version was thrashing the GC by removing
items in the middle of our large array of data points, so I rewrote it to sort
the data first and use a moving cursor to traverse the array, animating dots as
it went along. Our only garbage collection came when we were done with a
minute's worth of data. I made some more tweaks to fix slow canvas and DOM
interactions and we were good to go. We went from slowing down around 500
points per minute to slowing down at around 70,000 points per minute. At peak
we saw 6,500 downloads per minute, so the page worked beautifully.

[glow]: http://glow.mozilla.org
[@potch]: https://twitter.com/potch
[Flowing Data]: http://flowingdata.com/2011/03/22/firefox-4-downloads-in-real-time/
[video]: http://www.youtube.com/watch?v=ummATvv6Nc0
