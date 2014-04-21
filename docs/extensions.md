# Extensions
The extension system is provided by the [Extension Cartridge](../core/lib/altair/cartridges/extension/README.md)
An extension is an AMD module that inherits altair/cartridges/extension/extensions/_Base and whose execute method receives every
module/subcomponent that is added to the system.

## Current Extension
Below are some extensions that come with Altair and the methods they mixin.

### Foundry
Allows you to create instance of classes by their nexus path. Everything created through the Foundry extension is
extended through the Extension system.

    this.foundry('path/to/Class').then(function (obj) {

        console.dir(obj);

        //Classes created through foundry have access to some pretty helpful stuff, here is the API available to them:

        //the module we sit under, altair:CommandCentral::adapters/Prompt would return an instance if the altair:CommandCentral module
        var  module = obj.module;

        //add an event listener just like you would from a module
        obj.on('altair:CommandCentral::register-adapters').then().otherwise();

        //emit an event like a module
        obj.emit('altair:PostMaster::did-receive-email').then().otherwise();

    }).otherwise(function (err) {
        console.log(err);
    });

    //using nexus path (vendor:Module)
    this.foundry('titan:Alfred::path/to/Class').then(function (obj) {
        console.dir(obj);
    }).otherwise(function (err) {
        console.log(err);
    });


### Apollo

Coming soon