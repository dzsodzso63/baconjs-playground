baconjs-playground
==================

Trying out Bacon.js, an "FRP Zebra"

#### Features so far

* Creating objects (rectangles) using "+" icon on header
* Flash message to give feedback
* Zebra on object click, with Move, Scale, Rotate, Delete functions
* Simple meeting feature to sync changes from left column to the right one
* Sync only on the end of the transformations
* Persist objects using localStorage of the browser


#### Requirements

* CoffeeScript installed (Install [Node](http://nodejs.org/), if you don't have it)

With Node installed, install CoffeeScript node package:

```bash
npm install -g coffee-script
```


#### Compile CoffeeScript

Watch and compile CoffeeScript files with this command:

```bash
coffee -wc -o js/ js/coffee/*.coffee
```
