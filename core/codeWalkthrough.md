#Code Walkthrough v0.0.1


##Startup

node altair.js
node altair.js -test

Altair is AMD compliant, we use dojo as our amd loader. That being said, the very first thing altair does at runtime is include and configure our dojo loader, which will in turn boot strap almost everything our platform needs to function.

We do have an optional -test flag.
if included, the -test flag will tell altair that we want to load our framework with unit tests on.

##Bootstrapping  > node altair.js -test

***

####bootstrap-test.js


Our bootstrap requires the altair/TestRunner module, and a configuration file (test.json), instantiates a TestRunner, starts it with the loaded configuration file of path strings, then executes each test in each provided directory, on it's execution phase.

By default, we load core/config/test.json

our TestRunner does have the capacity to understand wildcards (*)  in a directory path string.
(e.g. core/vendors/*/tests)

It will generate urls for each directory where the generated path string contains a directory name where the wildcard was inserted.
This is recursive, so multiple wildcards can be used in a paths entry.


Tests run, they fail or pass, and everyone in the kingdom was content.


If you want a general overview of what each piece of code was written to do, or what features a component is supposed to have, you can browse the tests and read their comments; Understand the test failures, and you're on your way!

