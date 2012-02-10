---
title: "Introducing Push Notifications"
layout: post
tags: [mozilla, push notifications]
---

Push notifications are a way for websites to send small messages to users when
the user is not on the site. iOS and Android devices already support their own
push notification services, but we want to make notifications available to the
whole web.  We're making prototypes and designing the API right now and want to
share our progress.

## How it works

1. The website gets a URL where it can send notifications to the user. The URL
   points to the Notification Service, and is a secret between the user and the
   website.
2. The site sends a notification to the Notification Service.
3. The Notification Service delivers the message to Firefox on the desktop, on
   Android, on Boot to Gecko, or on iOS through Firefox Home; we'll find the
   right place to deliver the message.

To start sending push notifications, a website needs to ask the user for
permission. Here's some example code:

{% highlight javascript %}
var notification = navigator.mozNotification;
if (notification && notification.requestRemotePermission) {
  // Ask the user to allow notifications.
  var request = notification.requestRemotePermission();
  request.onsuccess = function() {
    var url = request.result;
    console.log('New push URL: ' + url);
    // We got a new push URL, store it on the server.
    jQuery.post('/push-urls/', {url: url});
  };
}
{% endhighlight %}

The notification API will live at `navigator.mozNotification` until it gets
standardized. First we get the API object and check that it exists. If it's
there we ask the user for permission to send notifications using
`notification.requestRemotePermission()`, which returns an object we use to
watch for events.

If the user grants permission, the browser will talk to the Notification
Service and grab a new URL that links our site to the user.  Every site/user
pair gets a unique URL.

The URL is available in the `onsuccess` callback as `request.result` and should
be sent back to the server and stored for future use.


## On the Server

Now that we have a URL, we can send messages from our servers to the
Notification Service.

    POST /some-queue-url HTTP/1.1
    Content-Type: application/json

    {"iconUrl": "http://example.com/shipped.png",
     "title": "Your package has shipped.",
     "body": "We shipped your package at 10am this morning.",
     "actionUrl": "http://example.com/order-status",
     "replaceId": "order-status"}

* **iconUrl**: URL of the icon to be shown with this notification.
* **title**: Primary text of the notification.
* **body**: Secondary text of the notification.
* **actionUrl**: URL to be opened if the user clicks on the notification.
* **replaceId**: A string which identifies a group of like messages. If the
  user is offline, only the last message with the same `replaceId` will be sent
  when the user comes back online.

Once the notification is in the system, we'll deliver it to the recipient on
all the devices they have Firefox installed, but we'll try not to show
duplicate notifications on different devices.

For a more detailed description, please check out our [wiki page][1].

[1]: https://wiki.mozilla.org/Services/Notifications/Push/API

**Update**: If you'd like to give feedback please email me, find me on
twitter, or reply to [this post][] on mozilla.dev.platform.

[this post]: http://groups.google.com/group/mozilla.dev.platform/browse_thread/thread/52f0c86c6e164d84#
