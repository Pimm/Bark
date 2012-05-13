# Bark

**_~3 kB observer library for client– and server-side JavaScript_**

Bark empowers you with the EventEmitter class. Unleash Bark, and you'll be writing [event-driven](//en.wikipedia.org/wiki/Event-driven_programming) JavaScript with a smile on your face.

The library is loosely based on [HSL](http://hxhsl.googlecode.com/) and [EventEmitter](https://github.com/Wolfy87/EventEmitter), and is inspired by [DOM Events](http://www.w3.org/TR/DOM-Level-3-Events/) and [Qt's Signals & Slots](//qt-project.org/doc/qt-4.8/signalsandslots.html).

## Example

Because of the nature of JavaScript, the EventEmitter class can be used in many different way. This example shows a use within [object-oriented](//developer.mozilla.org/en/Introduction_to_Object-Oriented_JavaScript) JavaScript using [composition](//en.wikipedia.org/wiki/Composition_in_object-oriented_programming).

	// Define the Dog class.
	function Dog() {
		// Add an eventEmitter property to the Dog instances.
		this.eventEmitter = new EventEmitter(this);
	}
	// Define the bark method.
	Dog.prototype.bark = function() {
		this.eventEmitter.emit("bark");
	};
	// Define a cool toString method.
	Dog.prototype.toString = function() {
		return "Dog";
	};
	
	// Create a dog. Sounds weird, doesn't it? "Create a dog".
	var rex = new Dog();
	// Create a function that will be called whenever the dog barks.
	rex.eventEmitter.add("bark", function() {
		console.debug(this + " is barking");
		// This is where the code that makes the cats run away goes.
	});
	// Make the dog bark. This will execute the function above, adding the rule to the console.
	rex.bark();

Documentation and more examples are [in the wiki](https://github.com/Pimm/Bark/wiki).

## Compatibility

Bark is tested and working in
 * Firefox
 * Opera
 * Chrome
 * IE 9

Additionally, there's a slightly larger version called of Bark called _Jurassic Bark_ which also supports
 * IE 8

To perform a test yourself, simply open `test/test.html` or `test/test.html?library-filename=jurassic-bark` using the browser you want to test the library in.

## Copying

Copyright 2009-2012 Pimm Hogeling, Edo Rivai, Oliver Caldwell

Bark is free software. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.**

Alternatively, the Software may be used under the terms of either the GNU General Public License Version 3 or later (the "GPL"), or the GNU Lesser General Public License Version 3 or later (the "LGPL"), in which case the provisions of the GPL or the LGPL are applicable instead of those above.
