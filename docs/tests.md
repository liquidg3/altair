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
The `doh/runner` (`altair/test` is an alias) we are currently using has a very limited number of assertions available.
This is it for now, we'll hopefully get to add many more as time goes on.

- `is(expected, actual, message)`: checks if actual == expected with array and object handling
- `isNot(expected, actual, message)`: Opposite of above
- `f(actual, hint)`: is actual [falsy](http://www.sitepoint.com/javascript-truthy-falsy/)
- `t(actual, hint)`: is actual [truthy](http://www.sitepoint.com/javascript-truthy-falsy/)


##Configure your tests
You need to tell the Altair [bootstrap-test.js](../core/bootstrap-test.js) and the [altair/TestRunner](../core/lib/altair/TestRunner.js)
what tests to load. The current `altair/TestRunner` only supports a basic glob search for files to load.

```json
{
    "name":         "My Cool App",
    "description":  "This is crazy pants!",
    "tests": {
        "debug": ".*",
        "glob": ["app/vendors/*/modules/*/tests/*.js"]
    },
    "default":      {}
}

```
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
by requiring the `core/tests/support/boot` script and your config.

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