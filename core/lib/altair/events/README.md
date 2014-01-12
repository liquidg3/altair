Events in Altair
===

The event system in Altair is a tad more powerful than any event system you're used to. That is because this version
is backed by [underscore-query](https://github.com/davidgtonge/underscore-query). This powerful query engine gives us
the ability to trigger event listeners selectively.

    /**
     * Altair has 2 ways to set listeners, the fun way is .on(eventName, query).then(...
     */
    this.nexus('Altair:Jarvis').on('DID_GESTURE', { 'gesture.type': 'the-force' }).then(function (e) {

        var device = e.get('device');

    });

    /**
     * The normal boring way is on(eventName, callback, query)
     */
    this.nexus('Altair:Jarvis').on('DID_GESTURE', function (e) {

        var device = e.get('device');

    }, { 'gesture.type': 'the-force' });



The examples above are powerful because it shows how to hook into any device that could possibly emit "the-force" gesture.
To see all the ways you can query, use the link to underscore-query above.
