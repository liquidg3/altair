# Getting Started

**help me come up with something easier**

step 1: create altair.js
step 2: paste this into it:
``` js
#!/usr/bin/env node

require('altair.io');
```
step 3:
``` bash
$ chmod 755 altair.js
```

step 4: create package.json
step 5: paste this into it:
``` js
{
    "name": "myproject",
    "version": "0.0.1",
    "description": "New things!",
    "main": "altair.js",
    "dependencies": {
        "altair.io":           ">=0.0.x"
    }

}
```

step 6:
``` bash
$ npm update
```

step 7:
``` bash
./altair.js
```

###what's next?

* download modules at [the lodge](../core/vendors/altair/modules/thelodge/README.md)
* build a module at [the forge](firstmodule.md)
* build a commander at [command central](../core/vendors/altair/modules/commandcentral/README.md)