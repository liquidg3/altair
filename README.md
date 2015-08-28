#Altair

##ALTAIR HAS BEEN HIJACKED

Ok, that's not entirly true. While the vision for Altair remains (bulding "experiences of everything"), we have taken a slight
detour. Myself (liquidg3) and my wife have started a new company. This has become my highest priority and while it has pulled
 me away from some of the things I wanted to build, the good news is that we've been using Altair to power a bunch of our systems.

We have built a [connected sign](https://instagram.com/p/4TAV6Okkxi), a [connected shoe display](https://instagram.com/p/4nDmfXkkwt/),
started a [prototype wearable](https://instagram.com/p/5oA_arEkz5/), an [sms booking system](http://spruce.me/blogs/technology/38980996-building-an-sms-receptionist-with-the-help-of-twilio-and-a-finite-state-machine),
and [a bunch of other cool stuff](https://instagram.com/sprucemen/).

You can follow the real world usage of Altair from our [site](http://spruce.me) and our [**Tech in Retail** blog](http://spruce.me/blogs/technology).

Altair is healthy and progressing nicely, but because it's being used now to run our company, the features that get added are
directly coupled to the value they provide us. That means for as cool as it would be to have Altair power a quadracopter, it's
probably not gonig to happen.

Additional bonus; the platform is extremely stable. Because we rely on it for appointment booking, profile building, and financial
reporting (among other things), we have spent extra time hardening the base. I'm proud to say that extra time has paid off. The 
platform itself has not had any issues in months (more than I can say for some of the new modules I've created).

Here are a list of modules that currently exist:

1. liquidfire:Dates - Gives you a 'date' property for the [Apollo ORM](https://github.com/liquidg3/altair/tree/master/core/lib/apollo) as well as other helpful date features (brings in [momentjs](http://momentjs.com) as well)
2. liquidfire:Images - Easy thumbnail generation as well as an 'image' property for Apollo
3. liquidfire:Files - Makes uploading files a breeze. Adds a 'file' property to Apollo
4. liquidfire:Spectre - An entity system; this.entity('User').find().where('firstName', '!=', 'taco').execute() 
5. liquidfire:Forms - Makes form rendering easy through titan:Alfred
6. liquidfire:Apollo - Couples Apollo with Altair
7. titan:Alfred - The ultimate web server. Uses Express3 for the moment. 
8. liquidfire:Onyx - Poweful view rendering (best used with titan:Alfred).
9. liquidfire:Curium - A fun test for building an openvg powered game from your RaspberryPi. Uses an Apple style ViewController paradigm
10. liquidfire:Sockets - Easy startup socket servers or connect to other socket servers
11. liquidfire:AngularJS - Helps integrate [AngularJs](https://angularjs.org) into Altair (used with titan:Alfred)
12. liquidfire:Shopify - Create your own [Shopify](http://shopify.com) store with ease!
13. liquidfire:Errors - Adapter based modules for sending yourself error logs, text messages, or whatever you want to keep yourself in the loop



##Original Readme

What if your coffee machine could start brewing your coffee as soon as you left your bedroom first thing in the morning?
How about having a garage door that opens when your car (and only your car) pulls up to it?

What would you do if you were able to make devices that were never meant to work together do so with elegance and ease?

Welcome to the IoE. Before you get started, you should read this whole thing. It's worth it and we'll keep it short!

#Altair is in active development.

View the [Getting Started Guide](https://github.com/liquidg3/altair/blob/master/docs/gettingstarted.md) if you've already
read the important bits **below**.

##Value Proposition

Altair was built with the vision of creating what we've coined as, "experiences of everything." This is more than just
connecting to devices: it's orchestrating complex interactions between those devices in such a way as to blend the technology
so beautifully into our lives that we don't even know that it's there. Not only that, but we should quickly begin to question
how we ever lived without it.

Controlling devices is only one of many things Altair can do (through the liquidfire:Jarvis module). You can download and
enable the titan:Alfred module to have web server functionality through [express](http://expressjs.com/) or any other
web application framework that exists for node. Then, have your webpage update in real time as sensors are triggered and
switches are flipped.

Connecting hardware and software are both brilliantly simple in Altair! Its flexible architecture actually allows it to
connect to other libraries, platforms, frameworks, as easily as devices.

##Core Values

The Altair team has core principles different than most other software teams. We strive for these values in everything that
we do. Sometimes we come up short, but we push each other to our limits and keep each other honest.

1. **Tomorrow must be more productive than today.** Over enough time, almost all things are renewable. All things except time.
We do everything in our power to enhance each others productivity while minimizing the complexities added to our lives. We
can't get our time back, so lets maximize what we can get done in that time.

1. **The difficulties in managing the code should not increase with lines of code.**
The 2 main distinctions between Altair and the colloquial approach to nodejs development will undoubtedly trip up most coming
in for the first time. But, the reward will be more powerful, more extensible, and much, much easier to maintain systems.
**Difference 1**: We chose [AMD](http://addyosmani.com/writing-modular-js). As far as implementation, we chose
[dojo's very powerful AMD implementation](http://dojotoolkit.org/documentation/tutorials/1.9/modules/) because its declare implementation conforms to the
[C3 Method Resolution Order.](http://www.python.org/download/releases/2.3/mro/) and if you're a python fan, you'll appreciate that.
**Difference 2**: We take a [promise](http://www.html5rocks.com/en/tutorials/es6/promises/) based approach to async operations. Any comparison
of callback and promise based code shows the true elegance of promises.

1. **One should focus on the problem they are trying to solve and forget all else.** We are trying to solve the problem
of how to connect and control many devices as elegantly and simply as possible, not whether or not Ember.js is cooler
than Angular.js or if python would kick ruby's ass in a street fight. Do that stuff over the foosball table, we'll be over
here building mind blowing experiences.

1. **Never forget that it's the value our systems provide to individuals that allows us to pursue our passions.** If you
have time to spend, why not spend it making someone's life better. We are going to launch our "App Store of Everything"
by 4th quarter 2014 and hope that hobbyists and enthusiasts will use it to fund their passions and maybe even allow them
to start full time enterprises.

1. **Commit on a convention, not on an implementation.** By wrapping complex systems in simple and consistent API's, we
are able to break the coupling between us and our 3rd party choices. Example, don't like how the express handles its web
requests, fine, use titan:Alfred's adapter engine to drop in another one. Hell, don't like how the titan:Alfred module
normalizes web experiences, then create a new module to do it your way.

##Events++

One thing that makes Altair different is its event engine. We have taken the observer pattern and added a query engine, then
plopped in a promises!

See it in action:

    /**
     * Altair has 2 ways to set listeners, the "promise based" way is .on(eventName, query).then(...
     */
    this.on('liquidfire:Jarvis::did-gesture', { 'gesture.type': 'the-force' }).then(function (e) {

        //the device that triggered the gesture
        var device = e.get('device');

        //cheating =)
        this.nexus('liquidfire:Jarvis').device('living-room-lights').toggle();

    }.bind(this)).otherwise(function (err) {

        //the Jarvis module is probably not installed

    });

    /**
     * The normal normal way: on(eventName, callback, query)
     */
    this.on('liquidfire:Jarvis::did-gesture', function (e) {

        ....

    }.bind(this)), { 'gesture.type': 'the-force' });

We have build a simple QueryAgent system that allows us to swap out query engines. Currently we use the kickass
[underscore-query](https://github.com/davidgtonge/underscore-query) and absolutely love it! But, in Altair tradition,
no commitment is made to it.

Most of the time, when you're working with events in Altair, you'll be in a module and using config/listeners.json.
Then, what you have is a map of all the events to which your module connects. Check out how we easily we can react to a
verbal command send from an imaginary thermostat with a microphone attached to it:

    {

        "liquidfire:Jarvis::did-receive-verbal-command": {

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
     * When someone says a verbal command, this callback will be triggered in our module.
     */
    onDidYellAtThermostat: function (e) {

        var thermostat = e.get('device'),
            target     = e.get('command').text.match(/.*?(\d+) degrees/)[1];

        if(target) {

            //set the temp in fahrenheit because we're 'merican.
            thermostat.set('tempF', 85).then(function () {
                console.info('Temperature now set');
            }.bind(this));

        }
        //if we could not parse a target temperature from the command give the user some feedback by pulsing the living
        //room lights (where the thermometer is installed).
        else {

            //it may be a little extreme to do something like this, maybe we should do some text to speech? ;)
            this.nexus('liquidfire:Jarvis').devicesByTags(['hallway', 'lights']).pulse({
                duration:   500,
                loop:       2,
                colors:     ['ff0000', 'ffffff']
            }).execute().then(function () {

            });

        }

    }

The examples above would never scale when it comes to controlling 1000's of devices. That's cool, the examples are just
to give you a taste of how easy it is to create "experiences in everything."

##What Next?

Read more [docs](https://github.com/liquidg3/altair/tree/master/docs).