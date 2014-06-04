#Writing (asynchronous) tests
Having good test coverage goes a long way to a relaxing evening. Writing and running tests in Altair is extremely easy.

I'm going to assume you already have your [app](app.md) created and you're familiar with the basics [creating a module](firstmodule.md).

The [altair/TestRunner](../core/lib/altair/TestRunner.js) used in Altair is a [Lifecycle](lifecycle.md) object that runs all the tests
 using the [Dojo Object Harness](http://dojotoolkit.org/reference-guide/1.9/util/doh.html). This was the easiest to integrate
 out of the gate, but you can change the `altair/test` alias to using any test framework you want (provided you adapt it
 to the d.o.h. API described below).

###Where to put tests
Tests can go anywhere on your filesystem, but it often makes sense to do them in 1 of 2 ways:

1. For your app
2. For each module

I'm going to focus on creating them for your module since in practice, it is really best to distribute your module with
tests.

*Assume that `./` is the path to a module, e.g. `core/vendors/altair/modules/commandcentral`.*

###Create your first test
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


###Modify altair.json
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

- `debug`: A string passed to [visionmedia/debug](https://github.com/visionmedia/debug) to allow you to better control what is logged.
- `glob`: All paths are resolved against local path settings and passed through to [glob](https://github.com/isaacs/node-glob);

If you remember from setting up your [app](app.md), the `app` path should point to the everything in the directory that
contains your altair.json (probably your current directory). The `glob` option in this example will load all tests in your
modules. Any path that starts with `/` will be handled as an absolute path and no path mapping will take place. This
allows you to group all the tests for your organization into a separate distributable package.

###Run your tests
Now that you're all setup, you are ready to run your tests.

```bash
$ cd /path/to/app
$ altair --test
```