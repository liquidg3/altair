Events in Altair
===

The event system in Altair is a tad more powerful than any event system you're used to. That is because this version
is backed by [underscore-query](https://github.com/davidgtonge/underscore-query). This powerful query engine gives us
the ability to trigger event listeners selectively.

    /**
     * Altair has 2 ways to set listeners, the chain'able way is .on(eventName, query).then(...
     */
    this.on('altair:Jarvis::DID_GESTURE', { 'gesture.type': 'the-force' }).then(function (e) {

        //the device that triggered the gesture
        var device = e.get('device');

    });

    /**
     * The normal normal way is on(eventName, callback, query)
     */
    this.on('altair:Jarvis::DID_GESTURE', function (e) {

        //the device that triggered the gesture
        var device = e.get('device');

    }, { 'gesture.type': 'the-force' });


The examples above are powerful because it shows how to hook into any device that could possibly emit "the-force" gesture.
To see all the ways you can query, use the link to underscore-query above (Note: ignore the chain'able API, you will not
be writing much code for event listeners, you will be setting them up inside your config/listeners.json.

Using the Emitter
==

The Emitter is a simple mixin that will give your component all the pieces it needs to be a 1st class event dispatching
citizen.

