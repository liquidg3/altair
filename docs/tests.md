#Writing (asynchronous) tests
Having good test coverage goes a long way to a relaxing evening. Writing and running tests in Altair is extremely easy.

I'm going to assume you already have your [app](app.md) created and you're familiar with the basics [creating a module](firstmodule.md).

The [TestRunner](../core/lib/altair/TestRunner.js) used in Altair is a [Lifecycle](lifecycle.md) object runs all the tests
 using the [Dojo Object Harness](http://dojotoolkit.org/reference-guide/1.9/util/doh.html). This was the easiest to integrate
 out of the gate, but you can change the "altair/test" alias to using any test framework you want (provided they have a
 register() function that follows the d.o.h. API).

##Your first test
###Where to put tests
Tests can go anywhere on your filesystem, but it often makes sense to do them in 1 of 2 ways:

1. For your app
2. For each module

I'm going to focus on creating them for your module since in practice, it is really best to distribute your module with
tests.

*Assume that `.\/` is the path to a module, e.g. core/vendors/altair/modules/commandcentral.*

###Create your first test
Take this placeholder and drop it into ./tests/my-test.js

```js
define(['altair/test'],
    function (test) {

        test.register('my-test', {

            "test making bid": function (t) {

                var fu      = 'bar',
                    pass    = false;

                t.is('bar', fu, 'The fu is not bar'); //passes
                t.isNot('bar', fu, 'The fu is bar'); //fails
                t.f(pass); //passes
                t.t(pass); //fails
                t.e(new Error()) //passes


            }



        });


    });
```

###The assertion api
The doh/runner we are currently using has a very limited number of assertions available. This is it for now, we'll hopefully
get to add many more as time goes on.

- **is(expected, actual, message)**: checks if actual == expected with array and object handling
- **isNot(expected, actual, message)**: Opposite of above
- **f(actual, hint)**: is actual [falsy](http://www.sitepoint.com/javascript-truthy-falsy/)
- **t(actual, hint)**: is actual [truthy](http://www.sitepoint.com/javascript-truthy-falsy/)
- **t(actual, hint)**: is actual [truthy](http://www.sitepoint.com/javascript-truthy-falsy/)


###Modify altair.json
You need to tell the Altair [bootstrap-test.js](../core/bootstrap-test.js) and the [TestRunner](../core/lib/altair/TestRunner.js)
what tests to load. The current TestRunner only supports a basic glob search for files to load.

```json
{
    "name":               "My Cool App",
    "description":        "This is crazy pants!",
    "default":            {
        "tests": {
             "glob": []
        }
    }
}

```