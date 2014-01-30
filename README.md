#Altair

**UNSTABLE - ONLY TESTS RUN**

    #node altair.js -test

Welcome to the IoE. Before you get started, you should read this whole thing. It's worth it and we'll keep it short!

##Value Proposition

Altair was build with the vision of creating what we've coined as, "experiences of everything." This is more than just
connecting to devices: it's orchestrating complex interactions between those devices in such a way as to blend the technology
so beautifully into our lives that we don't even know that it's there. Not only that, but we quickly begin to question
how we ever lived without it.

But, controlling devices is only one of many things Altair can do (through the Altair:Jarvis module). You can download and
enable the Titan:Alfred module to have web server functionality through [express](http://expressjs.com/) or any other
web application framework that exists for node. Then, have your webpage update in real time as sensors are triggered and
switches are flipped.

Altair will blend the digital and analog words like nothing before it. Its flexible architecture actually allows it to
connect to other libraries, platforms, frameworks, as easily as devices. Connecting hardware and software are both
brilliantly simple in Altair!

##Core Values


The Altair team has core principles different than most other software teams. We strive for these values in everything that
we do. Sometimes we come up short, but we push each other to our limits and keep each other honest.

1. **Tomorrow must be more productive than today.** Over enough time, almost all things are renewable. All things except time.
We do everything in our power to enhance each others productivity while minimizing the complexities added to our lives. We
can't get our time back, so lets maximize what we can get done and minimize the time that it takes.

1. **The difficulties in managing the code should not increase with lines of code.** We chose
[dojo's very powerful AMD implementation](http://dojotoolkit.org/documentation/tutorials/1.9/modules/) to
keep code management from becoming a problem we have to solve). We also rely on a strict file and config structure.
It's proven very successful for us and we only intend on making it better.

1. **One should focus on the problem they are trying to solve and forget all else.** We are trying to solve the problem
of how to connect and control many devices as elegantly and simply as possible, not whether or not Ember.js is cooler
than Angular.js or if python would kick ruby's ass in a street fight. Do that stuff over the foosball table, we'll be over
here building mind blowing experiences.

1. **Never forget that it's the value our systems provide to individuals that allows us to pursue our passions.** If you
have time to spend, why not spend it making someones life better. We are going to launch our "App Store of Everything"
by 4th quarter 2014 and hope that hobbyists and enthusiasts will use it to fund their passions and maybe even allow them
to start full time enterprises.

1. **Commit on a convention, not on an implementation.** By wrapping complex systems in simple and consistent API's, we
are able to break the coupling between us and our 3rd party choices. Example, don't like how the express handles its web
requests, fine, use Titan:Alfred's adapter engine to drop in another one. Hell, don't like how the Titan:Alfred module
normalizes web experiences, then create a new module to do it your way.

##Events++


One thing that makes Altair different is its event engine. We have taken the EventEmitter api and added a query engine.
See it in action:

    /**
     * Altair has 2 ways to set listeners, the chain'able way is .on(eventName, query).then(...
     */
    this.on('Altair:Jarvis::DID_GESTURE', { 'gesture.type': 'the-force' }).then(lang.hitch(this, function (e) {

        //the device that triggered the gesture
        var device = e.get('device');

        //cheating =)
        this.nexus('Altair:Jarvis').device('living-room-lights').toggle();

    });

    /**
     * The normal normal way is on(eventName, callback, query)
     */
    this.on('Altair:Jarvis::DID_GESTURE', lang.hitch(this, function (e) {

        ....

    }), { 'gesture.type': 'the-force' });

We have build a simple QueryAgent system that allows us to swap out query engines. Currently we use the kickass
[underscore-query](https://github.com/davidgtonge/underscore-query) and absolutely love it! But, in Altair tradition,
no commitment is made to it.

Most of the time, when you're working with events in Altair, you'll be in a module and using config/listeners.json.
Then, what you have is a map of all the events to which your module connects. Check out how we easily we can react to a
verbal command send from an imaginary thermostat with a microphone attached to it:

    {

        "Altair:Jarvis::DID_RECEIVE_VERBAL_COMMAND": {

            "onDidYellAtThermostat": {
                "device.tags": "thermostat",
                "command.text": {
                    "$regex": [ "^thermostat" ]
                }
            }
        }

    }

From the config/listeners.json above you can see that the "onDidYellAtThermostat" method will be called when a device whose
tags contain thermostat and is given a verbal command (speech to text) that starts with the word "thermostat." This gives the very cool effect of making
it seem that we are commanding our thermostat by name (API's may change)!

Now check out how easy it is to control our imaginary thermostat and maybe some [Philips Hue Light Bulbs](http://www.meethue.com) too:

    ....

    /**
     * When someone says a verbal command, this callback will be triggered is our module.
     */
    onDidYellAtThermostat: function (e) {

        var thermostat = e.get('device'),
            target     = e.get('command').text.match(/.*?(\d+) degrees/)[1];

        if(target) {

            //set the temp in fahrenheit because we're 'merican.
            thermostat.set('tempF', 85).then(lang.hitch(this, function () {
                console.info('Temperature now set');
            });

        }
        //if we could not parse a target temperature from the command give the user some feedback by pulsing the living
        //room lights (where the thermometer is installed).
        else {

            //it may be a little extreme to do something like this, maybe we should do some text to speech? ;)
            this.nexus('Altair:Jarvis').devicesByTags(['hallway', 'lights']).pulse({
                duration:   500,
                loop:       2,
                colors:     ['ff0000', 'ffffff']
            }).execute().then(lang.hitch(this, function () {

            ));

        }


    }

The examples above would never scale when it comes to controlling 1000's of devices. That's cool, the examples are just
to give you a taste of how easy it is to create "experiences in everything."

##Modules

The module layer is the most powerful in all of Altair. This is because it is where all events in the system are centralized
on the module layer. This makes it very easy to hook into the events taking place in both the digital and analog worlds.