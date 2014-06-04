# Deferred
An `altair/Deferred` is a promise to take action later. It is currently a simple wrapper for
[dojo/Deferred](http://dojotoolkit.org/reference-guide/1.9/dojo/Deferred.html) with a few add-ons.

# Deferred vs. Promise
You'll notice that in Altair you are always instantiating `Deferred()` objects. Why not a `new Promise()`? If you've looked
at the source of Altair you'll also notice @return {altiar.Promise} all over the place. So what's the difference?

The difference is that a Promise does not have either the `resolve()`, `reject()`, & `progress()` methods. If you think about
it, you wouldn't want someone else resolving your Deferred behind your back.

This also helps when you get sloppy and try to invoke `resolve()` on something you should not have.

## Additions
The dojo/Deferred didn't really cover everything we needed so we've added a few things. This list
is expected to grow.

 - `reject(message, strict)`: explicitly passing false for *strict* will suppress error logging
 - `step(callback)`: called every time d.progress() is called
 - `hasWaiting()`: returns true if there are listeners set on the deferred (meaning someone called .then())

 ## _DeferredMixin
 This mixin gives you a ton of useful methods for dealing with async logic.