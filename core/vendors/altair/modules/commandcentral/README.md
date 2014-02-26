### Command Central

This is cool. You can build command line apps with stylesheets!

Start by adding the _HasCommandersMixin into your module. Not sure how to build a module? It's easy, start (here)

## blessed

## colors

Base colors

    $base03:    #002b36;
    $base02:    #073642;
    $base2:     #eee8d5;
    $base3:     #fdf6e3;

Content

    $base01:    #586e75;
    $base00:    #657b83;
    $base0:     #839496;
    $base1:     #93a1a1;

Accent

    $yellow:    #b58900;
    $orange:    #cb4b16;
    $red:       #d30102;
    $magenta:   #d33682;
    $violet:    #6c71c4;
    $blue:      #268bd2;
    $cyan:      #2aa198;
    $green:     #859900;

Color Guide - http://thechangelog.com/solarized-precision-color-scheme-for-multiple-applicatio/


## figlet

For better, more robust documentation, visit [figlet on npm](https://www.npmjs.org/package/figlet). Below is an example
and some helpful references for working with figlet in Command Central.

figlet Example - commanders/styles.css

    #bg {
        content: "The Forge";
        figlet-font:  "Univers";
        font: "Univers"; <-- alias for figlet-font
        figlet-horizontalLayout: "default";
        figlet-verticalLayout: "default";
    }


figlet-font
    ? - outputs all fonts on current system to console
    Stellar
    Stforek
    Stick Letters
    Stop
    Straight
    Sub-Zero
    Swamp Land
    Swan
    Sweet
    Tanja
    Tengwar
    Term
    Test1
    Thick
    Thin
    Thorned
    Three Point
    Ticks Slant
    Ticks
    Tiles
    Tinker-Toy
    Tombstone
    Train
    Trek
    Tsalagi
    Tubular
    Twisted
    Two Point
    Univers
    USA Flag
    Varsity
    Wavy
    Weird
    Wet Letter
    Whimsy
    Wow

figlet-horizontalLayout

    default
    full
    fitted
    controlled smushing
    universal smushing

    Default value: 'default'


figlet-verticalLayout

    default
    full
    fitted
    controlled smushing
    universal smushing

    Default value: 'default'

