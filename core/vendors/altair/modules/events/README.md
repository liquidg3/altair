Events Module Say Whaa?
===

This module doesn't really do much but give module developers a convenient way to let their modules' events be known
to the world at large.

To get all the events everyone has registered in Altair, you can do something like this:

    //js
    this.nexus('Altair:Events').getAllEvents().then(function (events) {

        //will output every event in every module in Altair
        console.log(events);

    });

Be careful, that could get to be a pretty long list.