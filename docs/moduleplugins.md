# Module Plugins
The module plugin feature is provided by the [Module Cartridge](../core/lib/altair/cartridges/module/README.md) A plugin
is an object that inherits altair/cartridges/module/plugins/_Base and whose execute method receives every module that
is added to the system. At that point, the plugin can safely mixin additional functions to every module.


## Current Plugins
Below are the plugins that come with Altair and the methods they mixin.

### Foundry
Allows you to create instance of classes by their nexus path.

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

### Deferred

    //easy access to altair/Deferred
    var d = new this.Deferred();

### Apollo

Coming soon