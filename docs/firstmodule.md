# Modules
Altair's module layer is the starting point for any new idea or concept you want to turn into a product. It's like the
controller for a whole feature set. It delegates all work to other component (adapters, commanders, etc) so it is
considered good practice to keep your modules as thin as possible.

So, what does a module really do? It is what connects all the activities taking place elsewhere on the platform
with the systems you are producing. More often than not, it's simply hooking into events and kicking off whatever
business logic you need to fulfill the yours or the customers' needs.

# Building your first module

To get started, use
``` bash
$ altair
```
or to skip the commander select prompts use:
``` bash
$ altair forge module
```

or to create a module right away
``` bash
$ altair forge module --vendor liquidfire --name TestModule --dir app
```

Once your module is created, you should have a basic Module.js and package.json ready to go.