# Extensions
The extension system is provided by the [Extension Cartridge](../core/lib/altair/cartridges/extension/README.md)
An extension is an AMD module that inherits altair/cartridges/extension/extensions/_Base and whose execute method receives every
module/sub component that is added to the system.

## Current Extension
Below are some extensions that come with Altair and the methods they mixin to the prototype of any class to be instantiated.

### Foundry
Allows you to create instance of classes by their nexus path. Everything created through the Foundry extension is
extended through the Extension system.

 - **forge(pathOrNexusId[, options, config])**: loads, instantiates, and optionally calls startup() on any AMD module. @returns {Altair.Promise}.
 - **forgeSync(pathOrNexusId[, options, config])**: exactly like forge(), but returns the instantiated object.

**Examples**
```js
//this is relative to your current file
this.forge('path/to/Class').then(function (obj) {

    console.dir(obj);

    //every instance forged has a parent that is a reference to the forger
    var me = obj.parent;

    //events extension gives us on/emit
    obj.on('altair:CommandCentral::register-adapters').then().otherwise();
    obj.emit('did-receive-email').then().otherwise();

}).otherwise(function (err) {
    this.log(err);
}.bind(this));

//if you are in a subcomponent and need a class on your parent module, DO NOT USE: this.forge('../path/to/class')
this.parent.forg('path/to/Class');

//using nexus path (vendor:Module)
this.forge('titan:Alfred::path/to/Class').then(function (obj) {

    this.log(obj);

}.bind(this)).otherwise(function (err) {

    this.log(err);

}.bind(this));

//forge relative to process.cwd()
this.forge('./adapters/Email')
this.forge('../adapters/Sms')

//forge relative to current module
this.forge('adapters/Email')

//forging syncronously
var obj = this.forgSync('liquidfire:Alfred::path/to/Class', {
    foo: 'bar'
});

```

### Config
Because parseConfig() accepts a [Nexus id](terms.md), it is very useful for parsing configs located anywhere in Altair.
But, you can always pass a relative or absolute path.

 - **parseConfig(pathOrNexusId)**: parse any config (without file extension, only json supported for now). @returns {Altair.Promise}

**Examples**
```js

myFunctionDoingSomething: function () {

    //will look locally
    return this.parseConfig('configs/testing.json').then(function (config) {

        this.log(config);

    }.bind(this)).otherwise(function (err) {

        //log the error and pass it to the whomever is invoking myFunctionDoingSomething().then(...)
        this.log(err);

        return err;

    }.bind(this));

}

```

### Log
This is currently a simple wapper for [visionmedia/debug](https://github.com/visionmedia/debug);

 - **log(anything[,anything[,...]])** Logs anything to the console. You should always use this and never console.log directly.
 - **warn(anything[,anything[,...]])** Logs anything to the console with ::WARN.
 - **err(anything[,anything[,...]])** Logs anything to the console with ::ERR.
 
 
 ```js
 
 startup: function (options) {
 
 
    var _options = options || {};
    
    if (!_options.recommendedOption) {
    
        this.warn('you should put the recommended option');
    
    }
    
    
    return this.inherited(arguments);
 
 }
 
 
 ```

