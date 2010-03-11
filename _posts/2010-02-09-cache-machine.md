---
title: "Cache Machine: Automatic caching for your Django models"
layout: post
---

[Cache Machine][1] hooks into Django's ORM to provide easy object caching and
invalidation.

[1]: http://github.com/jbalogh/django-cache-machine

One of our primary goals with the rewrite of
[addons.mozilla.org](https://addons.mozilla.org) was to improve our cache
management.  Large sites like <abbr title="addons.mozilla.org">AMO</abbr> rely
on layers of caching to stay afloat, and caching database queries in memcached
is one of our favorite tools.

AMO heavily favors reads over writes, so we have great cache performance; the
hit rate ranges from 90%-98%.  However, once something is in the cache, it's
stuck there until timeout (60 minutes).  Combined with front-end caching, this
can mean it's a couple of hours before add-on developers see their changes roll
out to the site.  We don't like that.

For [zamboni](http://github.com/jbalogh/zamboni), our Django-based rewrite,
seamless object caching and invalidation was my first project.  Today we
released [Cache Machine][1] as a drop-in library for use in any Django
application.  The package is available on [pypi][] and the code is on
[github][1].

[pypi]: http://pypi.python.org/pypi/django-cache-machine


## Usage

Here's a cache-enabled model:

{% highlight python %}
from django.db import models

import caching.base

class Zomg(caching.base.CachingMixin, models.Model):
    val = models.IntegerField()

    objects = caching.base.CachingManager()
{% endhighlight %}

The first step is to inherit from [``CachingMixin``][2].  This mixin gives your
model ``post_sync`` and ``post_delete`` signal handlers that will flush the
object from cache.  It also adds a ``cache_key`` property that helps invalidate
the object properly.

Then you replace the default manager with [``CachingManager``][3].  Instead of
a normal ``QuerySet``, this manager returns ``CachingQuerySets`` which try to
pull objects from cache before performing a database lookup.


## How it works

Cache Machine knows how to cache normal ``QuerySets`` and ``RawQuerySets``.
Each ``QuerySet`` is keyed by the active locale and the SQL of the underlying
query.  The ``CachingQuerySet`` wraps around  ``Queryset.iterator()`` to check
cache before hitting the database.

Invalidation is the interesting part.  As we iterate through a set of objects
in a database result, we create a "flush list" for each object.  The flush list
maps each object to a list of cached queries it's a member of.  When an object
is invalidated in the ``post_sync`` signal, all of the queries it was a part of
are immediately invalidated.

Parent and child foreign-key relationships are also tracked in the flush lists.
If a parent object changes, its flush list will be invalidated along with all
children that point to it, and vice versa.


## Issues

Only the ``memcached`` and ``locmem`` backends are supported.  Cache Machine
relies on infinite cache timeouts for storing flush lists, but none of Django's
builtin backends support this (even though the memcached server does).  We wrap
the memcached and locmem backends to fix the infinite timeout issue, but file
and database backends aren't implemented since they're not useful to us.

Cache Machine does not cache ``values()`` and ``values_list()`` calls.  Since
these methods don't return full objects, we can't know how to invalidate them
properly.  They could be overridden to do normal lookups and then pull out the
results, but I haven't gotten around to that yet.

``count()`` queries will not be cached.  These can't be invalidated
efficiently.  I recommend denormalizing your tables and adding a count field if
you need to access it often. *Update: limited count caching was enabled in
[this commit][cache-count].*

[cache-count]: http://github.com/jbalogh/django-cache-machine/commit/c1e871f4d7

Cache Machine has a few ``log.debug`` calls in its caching and invalidation
internals.  These work fine with zamboni, since we set up our logging on
startup.  I don't know if these calls will be problematic without or logging
config.  Let me know.

[2]: http://jbalogh.me/projects/cache-machine/#caching.base.CachingMixin
[3]: http://jbalogh.me/projects/cache-machine/#caching.base.CachingManager
