#Writing (asynchronous) tests
Having good test coverage goes a long way to a relaxing evening. Writing and running tests in Altair is extremely easy.

I'm going to assume you already have your [app](app.md) created and you're familiar with the basics [creating a module](firstmodule.md).

The [altair/TestRunner](../core/lib/altair/TestRunner.js) used in Altair is a [Lifecycle](lifecycle.md) object that runs all the tests
 using the [Dojo Object Harness](http://dojotoolkit.org/reference-guide/1.9/util/doh.html). This was the easiest to integrate
 out of the gate, but you can change the `altair/test` alias to using any test framework you want (provided you adapt it
 to the d.o.h. API described below).

##Where to put tests
Tests can go anywhere on your filesystem, but it often makes sense to do them in 1 of 2 ways:

1. For your app
2. For each module

I'm going to focus on creating them for your module since in practice, it is really best to distribute your module with
tests.

*Assume that `./` is the path to a module, e.g. `core/vendors/altair/modules/commandcentral`.*

*If you are testing your app, assume that `./` is `/path/to/app/`.*

##Create your first test
Take this placeholder and drop it into `./tests/my-test.js`

```js
define(['altair/test'],
    function (test) {

        test.register('my-test', {

            "test that the fu is bar": function (t) {

                var fu      = 'bar',
                    pass    = false;

                t.is('bar', fu, 'The fu is not bar'); //passes
                t.isNot('bar', fu, 'The fu is bar'); //fails
                t.f(pass); //passes
                t.t(pass); //fails

            }

        });

    });
```

###The assertion api
You can use any assertion library you want. The `doh/runner` (`altair/test` is an alias) we are currently using has a
very limited number of assertions available:

- `is(expected, actual, message)`: checks if actual == expected with array and object handling
- `isNot(expected, actual, message)`: Opposite of above
- `f(actual, hint)`: is actual [falsy](http://www.sitepoint.com/javascript-truthy-falsy/)
- `t(actual, hint)`: is actual [truthy](http://www.sitepoint.com/javascript-truthy-falsy/)

###Including 3rd party assertion library
You don't have to use the very weak doh assertion library, you can use whatever you want. Here are a few:

- [should.js](https://github.com/visionmedia/should.js)
- [chai](http://chaijs.com)
- [expect](https://github.com/LearnBoost/expect.js)

In this scenario I'm going to use chai.js (chosen randomly as I am testing them each out to see what I like the best).

*Step 1* - drop devDependencies into your module's or app's `package.json`
```json
{
    "name":         "liquidfire:Sockets",
    "version":      "0.0.2",
    "description":  "Allows the browser to participate in event emitting/listening in Altair.",
    "dependencies": {
        "sockjs":           ">=0.3.8",
        "socket.io":        "1.0.6",
        "socket.io-client": "1.0.6"
    },
    "devDependiencs": {
        "chai":             "*"
    }
}

```

*Step 2* - include your new assertion library
```js
define(['altair/test',
        'altair/plugins/node!chai,
    function (test,
              chai) {

        var expect = chai.expect;

        test.register('my-test', {

            "test that the fu is bar": function (t) {

                var fu      = 'bar',
                    pass    = false;

                expect(fu).to.equal('bar'); //passes
                expect(fu).to.not.equal('bar'); //fails

            }

        });

    });
```


##Configure your tests
You need to tell the Altair [bootstrap-test.js](../core/bootstrap-test.js) and the [altair/TestRunner](../core/lib/altair/TestRunner.js)
what tests to load. The current `altair/TestRunner` only supports a basic glob search for files to load. Here is how your
`altair.json` may look

```json
{
    "name":         "My Cool App",
    "description":  "This is crazy pants!",
    "tests": {
        "debug": ".*",
        "glob": ["./vendors/*/modules/*/tests/*.js"]
    },
    "default":      {}
}

```
*Note* - if you are building tests for your `App`, add `./tests/*.js` to `glob`.

###Test config API
Here is what you can currently pass under the `tests` block of your `altair.json`.

- `debug`: A string passed to [visionmedia/debug](https://github.com/visionmedia/debug) to allow you to better control what is logged.
- `glob`: All paths are resolved against local path settings and passed through to [glob](https://github.com/isaacs/node-glob);

If you remember from setting up your [app](app.md), the `app` path should point to the everything in the directory that
contains your altair.json (probably your current directory). The `glob` option in this example will load all tests in your
modules. Any path that starts with `/` will be handled as an absolute path and no path mapping will take place. This
allows you to group all the tests for your organization into a separate distributable package.

##Run your tests
Now that you're all setup, you are ready to run your tests.

```bash
$ cd /path/to/app
$ altair --test
```

##Booting up Altair for your tests
Often times the components you are testing will needs the entire Altair runtime in order to function properly. Luckily,
the `core/tests/support/boot` script is here to help.

In order to get Altair booting, you have to do 2 things:

1 . **Create `./tests/cartridges.json`**. This can be anything you want, just remember it for later. Make sure to drop the
following into it (notice the {{placeholders}}):

```json
{
    "apollo":    {
        "path":    "altair/cartridges/apollo/Apollo",
        "options": {}
    },
    "nexus":     {
        "path":    "altair/cartridges/nexus/Nexus",
        "options": {}
    },
    "database":  {
        "path":    "altair/cartridges/database/Database",
        "options": {}
    },
    "module":    {
        "path":    "altair/cartridges/module/Module",
        "options": {
            "modules": ["{{vendorname}}:{{ModuleName}}", "altair:Adapters"],
            "paths": ["tests/vendors/{{vendorname}}/modules", "core/vendors/altair/modules"]
        }
    },
    "extension": {
        "path":    "altair/cartridges/extension/Extension",
        "options": {
            "extensions": [
                "altair/cartridges/extension/extensions/Paths",
                "altair/cartridges/extension/extensions/Config",
                "altair/cartridges/extension/extensions/Package",
                "altair/cartridges/extension/extensions/Deferred",
                "altair/cartridges/extension/extensions/Apollo",
                "altair/cartridges/extension/extensions/Nexus",
                "altair/cartridges/extension/extensions/Events",
                "altair/cartridges/extension/extensions/Foundry",
                "altair/cartridges/extension/extensions/Log"
            ]
        }
    }
}
```
The `module` block (which loads and configures the module cartridge) is the only block in this config that is of any real
interest. In general, the other cartridges will stay the same. The above config currently reflects the settings used in a [base
install of the platform](../core/config/altair.json). You can customize which modules load by customizing the options
described below.

- `module.options.modules`: The names of the modules you want to load
- `module.options.paths`: Paths to look for modules. This folder is usually called `modules`. The `tests` path is set
to `process.cwd()`, so `tests/{{vendorname}}/modules` will resolve to `/absolute/path/to/your/vendors/modules`.

2 . **Boot the runtime**. Now that your configuration is ready, you can use the boot and config to start Altair. You do that
by requiring the `core/tests/support/boot` script and your newly created `altair/plugins/config!./cartridges` config.

```js
define(['altair/test',
        'core/tests/support/boot',
        'altair/plugins/config!./cartridges'],
    function (test,
              boot,
              cartridges) {

        test.register('handbid-bid-model', {

            "test that fu is still bar": function (t) {

                //tests that return Promises will wait (async spoiler!) until they are resolved
                //invoking boot.nexus() will return you an instance of Nexus
                return boot.nexus(cartridges).then(function (nexus) {

                    //You now have nexus and access to everything in Altair
                    var myModule = nexus('handbid:Bids');

                    //do your tests as you normally would
                    t.is('bar', myModule.fu, 'myModule\`s fu is not bar');

                });

            }



        });


    });
```
That's it, pretty easy! Altair itself is very thin, so booting it up for every one of your tests ain't no thang.

##Asyncronous tests
Handling async operations during tests is extremely easy.

```js
define(['altair/test',
        'altair/Deferred'],
    function (test,
              Deferred) {

        test.register('my-test', {

            "test that the fu is bar after a half second": function (t) {

                var dfd = new Deferred(),
                    fu = 'taco';

                setTimeout(function () {

                    fu = 'bar';

                    dfd.resolve(fu);

                }, 500);

                //return the promise (test will resolve when all then()'s are finished)
                return dfd.then(function (fu) {

                    t.is('bar', fu, 'the fu is not bar'); //passes

                    fu = 'cheesy burrito';

                    return fu;

                }).then(function (fu) {

                    t.is('bar', fu, 'somebody is hungry'); //fails

                    var dfd = new Deferred();

                    setTimeout(function () {
                        dfd.resolve('bar');
                    });

                    return dfd;

                }).then(function (fu) {

                    t.is('bar', fu, 'the fu is not bar'); //passes

                });

            }

        });

    });
```
And that pretty much covers it. You are now ready to build tests for all your everything!

## Testing your (web)app
You built an app (or web app) using `altair forge app` or `altair alfred forge` and you want to test some controllers, maybe some
routes, etc.

###Step 1. create test file
Create `tests.json` inside of `/path/to/your/app/tests/` and put the following into it.

```json

var env = 'dev'; //set to 'test' to use custom configurations

define(['altair/test',
        'core/tests/support/boot',
        'altair/plugins/node!config-extend',
        'altair/plugins/config!core/config/altair.json?env=' + env,
        'altair/plugins/config!../altair.json?env=' + env],
    function (test,
              boot,
              extend,
              altairConfig,
              config) {

        //mixin the configs
        config = extend(altairConfig, config);

        //setup AMD environment like an app
        require({
            paths: {
                app: process.cwd()
            }
        });

        //setup paths
        config.paths = ['core', 'app'];
        
        //make sure command central does not start
        config.cartridges.module.options.moduleOptions['altair:CommandCentral'].autostart =  false;
        
        //OPTIONAL: make sure alfred uses the mock strategy
        //config.cartridges.module.options.moduleOptions['titan:Alfred'].site.strategy = 'mock';
        
        //OPTIONAL: disable sockets (or use mock socket)
        //config.cartridges.module.options.moduleOptions['liquidfire:Sockets'].sockets = {}
        //config.cartridges.module.options.moduleOptions['liquidfire:Sockets'].sockets[0].name = 'mock'


        /**
         * Register tests
         */
        test.register('appointment-tests', {

            "test instantiating scheduler": function (t) {

                return boot.nexus(config.cartridges, config).then(function (nexus) {

                    //the name of your Alfred app is {{vendorName}}:*
                    var app = nexus('spruce:*'),
                        route = app.server.appConfig.routes['/'],
                        altair = nexus('Altair');

                    t.is(route.controller.name, 'spruce:*/controllers/Index', 'the wrong controller came back');

                    //your app
                    console.log(app);
                    
                    //shutdown altair
                    return altair.teardown();


                });


            }

        });

    });
```

now you have your fulling booted altair runtime ready for you. Anything you can do in your app, you can do here in the test.

