---
title: How to Add Push Notifcations to your Website
layout: post
tags: [mozilla, push notifications]
---

This week I released <https://github-notifications.herokuapp.com/>, a site that
demos [push notifications in Firefox][blog]. It uses Github web hooks to send
notifications when there's a commit to one of your repositories. Push
notifications are currently implemented in Firefox as an experimental
[add-on][].

This post shows the code I used to send push notifications from the site.

## Get a Push URL

When you give a website permission to send push notifications, Firefox asks the
Push Notification Service to create a URL for the site to contact you. That URL
is returned through the `mozNotification` javascript API.

{% highlight javascript %}
var notification = navigator.mozNotification;
if (notification && notification.requestRemotePermission) {
  var request = notification.requestRemotePermission();
  request.onsuccess = function() {
    var url = request.result.url;
    jQuery.post("/add-push-url", {"push-url": url});
  }
}
{% endhighlight %}

This code checks that `navigator.mozNotification` exists and then asks for
permission to send notifications using `requestRemotePermission()`. When the
`onsuccess` event fires, the callback `POST`s your push URL back to the server.

(You can play with the `mozNotification` API by installing the [add-on][].)


## Save the Push URL

The backend of my site is a simple [Flask][] app. The `User` model stores the
username and push URL:

{% highlight python %}
class User(Model, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    push_url = db.Column(db.String(256), nullable=True)
{% endhighlight %}

Users are created with an empty `push_url` after they connect to Github through
OAuth.  The `push_url` is filled in by calling the `/add-push-url` view:

{% highlight python %}
@app.route('/add-push-url', methods=['POST'])
def add_push_url():
    username = session['username']
    user = User.query.filter_by(username=username).first_or_404()
    user.push_url = request.form['push-url']
    db.session.add(user)
    db.session.commit()
    notify(user.push_url,
           'Welcome to Github Notifications!',
           'So glad to have you %s.' % user.username)
    return ''
{% endhighlight %}


## Send a Notifcation

Sending a notification is as easy as `POST`ing to the push URL.

{% highlight python %}
def notify(push_url, title, body, action_url=None):
    msg = {'title': title,
           'body': body}
    if action:
        msg['actionUrl'] = action_url
    requests.post(push_url, msg)
{% endhighlight %}

Using the [requests][] library, `notify` sends a message back to the user's
push URL as a string of url-encoded parameters.  After that, the push
notification system takes care of getting the message to the user's browser.

That's all the code needed to send push notifications to Firefox; we're trying
to keep the system as simple as possible for developers. In the coming months
the add-on will be integrated into the browser and our Push Notification
Service will go live. If you have questions, feel free to contact me over email
or twitter.

[add-on]: https://github.com/jbalogh/push-addon/
[demo]: https://github-notifications.herokuapp.com/
[blog]: http://jbalogh.me/2012/01/30/push-notifications/
[Flask]: http://flask.pocoo.org/
[requests]: http://python-requests.org
