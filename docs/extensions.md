# Extensions
The extension system is provided by the [Extension Cartridge](../core/lib/altair/cartridges/extension/README.md)
An extension is an AMD module that inherits altair/cartridges/extension/extensions/_Base and whose execute method receives every
module/subcomponent that is added to the system.

## Current Extension
Below are some extensions that come with Altair and the methods they mixin.

### Foundry
Allows you to create instance of classes by their nexus path. Everything created through the Foundry extension is
extended through the Extension system.

 - **foundry(pathOrNexusId[, options, shouldAutoStart])**: loads, instantiates, and optionally calls startup() on any AMD module.


**Examples**
```js
this.forge('path/to/Class').then(function (obj) {

    console.dir(obj);

    //the module we sit under, altair:CommandCentral::adapters/Prompt would return an instance if the altair:CommandCentral module
    var  module = obj.module;

    //events extionsion gives us on/emit
    obj.on('altair:CommandCentral::register-adapters').then().otherwise();
    obj.emit('did-receive-email').then().otherwise();

}).otherwise(function (err) {
    this.log(err);
});

//using nexus path (vendor:Module)
this.forge('titan:Alfred::path/to/Class').then(function (obj) {
    console.dir(obj);
}).otherwise(function (err) {
    console.log(err);
});
```
### Log
This is currently a simple wapper for [visionmedia/debug](https://github.com/visionmedia/debug);

 - **log(anything[,anything[,...]])** Logs anything to the console. You should always use this and never console.log directly.

### Apollo

Coming soon