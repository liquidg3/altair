### Running altair is easy yo

step 1: create altair.js
step 2: paste this into it:

    #!/usr/bin/env node

    //Aaaaand go....

    require('altair.io');

step 3: create package.json
step 4: paste this into it:

    {
        "name": "myproject",
        "version": "0.0.1",
        "description": "New things!",
        "main": "altair.js",
        "dependencies": {
            "altair":           ">=0.0.x"
        }

    }
step 5: #npm update
step 6: ./altair.js