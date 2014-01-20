Nexus
===
Nexus is the registry for Altair. It uses a static map of data as well as a Resolver system (think chain-of-responsibility).
Ok, that's nice, but here are some examples on using it in Altair (if you want to see it used outside of Altair, check
core/tests/nexus.js):


    //inside a module
    ....
    onUserDidLogin: function (e) {

        var user    = e->get('user'),
            home    = this.nexus('Altair:Locations/Place/Model').findOne({
                'tags':     'home',
                'owners':   user
            });


        //if the user has no home, lets create one
        if(!home) {

            home = this.nexus('Altair:Locations/Place/Model').create({
                'tags': ['home'],
                'owners': user
            });

            home.save().then(lang.hitch(this, function () {

            });

        }

    }

In the example above, this.nexus('Altair:Locations/Place/Model') is returning an object that has findOne() and create()
methods. Lets dive into the string 'Altair:Locations/Place/Model' and see what is happening.

First, the Nexus object will check a local \_map to see if there is a property on it called 'Altair:Locations/Place/Model'.
Chances are, it will not.

Next it will look through all its register Resolvers by calling handles(name) on each one. The first one to match to
return true wins.

Lastly, the