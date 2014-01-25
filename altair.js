var path = require('path');

// Configuration Object for Dojo Loader:
dojoConfig = {
    baseUrl: path.resolve('./'), // Where we will put our packages
    async: 1, // We want to make sure we are using the "modern" loader
    hasCache: {
        "host-node": 1, // Ensure we "force" the loader into Node.js mode
        "dom": 0 // Ensure that none of the code assumes we have a DOM
    },
    packages: [
        {
            name: "dojo",
            location: "core/lib/dojo"
        },
        {
            name: "altair",
            location: "core/lib/altair"
        },
        {
            name: "core",
            location: "core"
        },
        {
            name: "doh",
            location: "core/lib/doh"
        },
        {
            name: "apollo",
            location: "core/lib/apollo"
        }
    ],
    deps: [
        "core/bootstrap"
    ]
};

if(process.argv[2] == '-test') {
    dojoConfig.deps = ['core/bootstrap-test'];
}

// Now load the Dojo loader
require("./core/lib/dojo/dojo.js");
