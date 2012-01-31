---
title: Nose Test Runner for Django
layout: post
tags: [nose, django]
---

**Update: you can now find django-nose on [pypi][] and [github][] with much
better documentation.**

[pypi]: http://pypi.python.org/pypi/django-nose
[github]: http://github.com/jbalogh/django-nose

I am not a big fan of Python's `unittest` library.  The Java-inspired API and
the difficulty of running tests are too much for me to deal with.  That's why I
love [nose][]: I can use regular `assert`s (or the Pythonic helpers in
`nose.tools`) and running all my tests is as simple as calling `nosetests` from
the command line.  On top of that, nose also supports cool plugins like
generating coverage reports and running tests interactively, test fixtures at
any granularity level, and simple selection of tests to run, making me a happy
tester.

Which is why I wrote a custom [test runner][tr] as soon as I started working on
[basie][].  Django provides its own test runner framework, but it's far less
advanced than nose.

I haven't packaged it up for PyPI yet, but you can download
[nose_runner.py][nr] from our repository.  Here's the documentation:

    Django test runner that invokes nose.

    Usage:
        ./manage.py test DJANGO_ARGS -- NOSE_ARGS

    The 'test' argument, and any other args before '--', will not be passed to
    nose, allowing django args and nose args to coexist.

    You can use

        NOSE_ARGS = ['list', 'of', 'args']

    in settings.py for arguments that you always want passed to nose.

[nose]: http://www.somethingaboutorange.com/mrl/projects/nose/
[tr]: http://docs.djangoproject.com/en/dev/topics/testing/#defining-a-test-runner
[basie]: basieproject.org
[nr]: http://code.basieproject.org/trunk/apps/django_nose/nose_runner.py
