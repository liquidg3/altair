# Deferred
An altair/Deferred is a promise to take action later. It is currently a simple wrapper for
[dojo/Deferred](http://dojotoolkit.org/reference-guide/1.9/dojo/Deferred.html) with a few add-ons.

## Additions
The dojo/Deferred didn't really cover everything we needed so we've added a few things. This list
is expected to grow.

 - **reject(message, strict)**: explicitly passing false for *strict* will suppress error logging
 - **step(callback)**: called every time d.progress() is called
 - **hasWaiting()**: returns true if there are listeners set on the deferred (meaning someone called .then())

 ## _DeferredMixin
 This mixin gives you a ton of useful facades for dealing with async logic.