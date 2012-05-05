/**
 * Copyright 2012 Pimm Hogeling, Oliver Caldwell (olivercaldwell.co.uk)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 *    * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 *      Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Alternatively, the contents of this file may be used under the terms of either the GNU General Public License Version 3 or
 * later (the "GPL"), or the GNU Lesser General Public License Version 3 or later (the "LGPL"), in which case the provisions of
 * the GPL or the LGPL are applicable instead of those above.
 */
"use strict";
/**
 * Whether Bark should support Internet Explorer 8.
 *
 * @define {boolean}
 */
var jurassic = true;
(function(exports) {
	/**
	 * An empty object, which will be used to determine which event types cannot be directly used.
	 * As objects might have a "watch" property by default, for instance, we should not use "watch" event types in such case.
	 * Event types that equal the names of properties that exist in object by default are referred to as "reserved" event types,
	 * and they will be prefixed.
	 *
	 * @const
	 * @type {!Object}
	 */
	var emptyObject = {};
	/**
	 * The prefix that will be prepended (or shoud I say, unshifted) to "reserved" event types.
	 *
	 * @const
	 * @type {!string}
	 */
	var reservedEventTypePrefix = "event-type-";
	/**
	 * A null-object function.
	 *
	 * @return {undefined}
	 */
	function nop() {
	}
	/**
	 * An event emitter is an object one can register event listeners to. 
	 *
	 * @constructor
	 * @param {*=} targetAndDefaultScope
	 */
	function EventEmitter(targetAndDefaultScope) {
		this.bondBundles = {};
		this.targetAndDefaultScope = undefined === targetAndDefaultScope ? this : targetAndDefaultScope;
	}
	if (jurassic) {
		/**
		 * Returns a version of the passed listener that is bound to the passed scope. (Jurassic Bark only.)
		 *
		 * @param {!function():*} listener
		 * @param {*} scope
		 * @return {!function():*}
		 */
		var bindListener = (function() {
			// If the engine supports Function.prototype.bind, use it.
			if (nop.bind) {
				return function(listener, scope) {
					return listener.bind(scope);
				};
			// If the engine does not support Function.prototype.bind, use this custom implementation.
			} else {
				return function(listener, scope) {
					return function() {
						listener.apply(scope, arguments);
					};
				};
			}
		})();
	}
	/**
	 * A bond between an event emitter and a listener.
	 * Contract: after creating a bond, you must set its bonds property.
	 *
	 * @constructor
	 * @param {!function():*} listener
	 * @param {*} scope
	 */
	function Bond(listener, scope) {
		this.listener = listener;
		this.originalScope = scope;
		// Define a callListener property, which is a callListener property that respects the scope.
		if (null === scope) {
			this.callListener = listener;
		} else {
			this.callListener = jurassic ? bindListener(listener, scope) : listener.bind(scope);
		}
	}
	if (jurassic) {
		/**
		 * Returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is
		 * searched backwards. (Jurassic Bark only.)
		 *
		 * @param {!Array} array
		 * @param {*} searchElement
		 * @return {number}
		 */
		var find = (function() {
			// If the engine supports Array.prototype.lastIndexOf, use it.
			if (false == jurassic || [].lastIndexOf) {
				return function(array, searchElement) {
					return array.lastIndexOf(searchElement);
				};
			// If the engine does not support Array.prototype.lastIndexOf, use this custom implementation.
			} else {
				return function(array, searchElement) {
					for (var index = array.length; index != -1; index--) {
						if (array[index] === searchElement) {
							return index;
						}
					}
					return -1;
				};
			}
		})();
	}
	/**
	 * Destroys the bond. The event emitter will no longer notify the listener. Bonds cannot be "undestroyed".
	 *
	 * @return {undefined}
	 */
	Bond.prototype["destroy"] = function() {
		var index = jurassic ? find(this.bonds, this) : this.bonds.lastIndexOf(this);
		if (-1 != index) {
			this.bonds.splice(index, 1);
			// Delete the data inside the bond.
			delete this.listener;
			delete this.originalScope;
			delete this.callListener;
			delete this.bonds;
			// Overwrite the destroy method, so calling it again will have no effect.
			this["destroy"] = nop;
		}
	};
	/**
	 * Destroys the bond right after the event emitter notifies the listener. Whether the event emitter has already notified the
	 * listener at the moment this method is called does not matter: the bond will be destroyed on its first use after this
	 * method has been called. This method returns this bond itself.
	 *
	 * @return {!Bond}
	 */
	Bond.prototype["destroyOnUse"] = function() {
		var bond = this;
		var oldCallListener = this.callListener;
		this.callListener = function() {
			oldCallListener.call(this);
			bond["destroy"]();
		};
		return bond;
	};
	/**
	 * Registers the passed listener as a listener for the passed event type, so the passed listener will be notified when the
	 * event emitter emits an event with the passed event type.
	 *
	 * Returns the bond between the event emitter and the listener. The bond can be destroyed by calling either the remove method
	 * of the event emitter, or the destroy method of the returned bond.
	 *
	 * The passed scope will be used as the default scope for the listeners that will be registered to this event emitter. If no
	 * scope is passed, the event emitter itself will be the default scope.
	 *
	 * If a listener is registered to an event emitter while it is processing/emitting an event, that listener will not be
	 * notified of that event.
	 *
	 * If multiple identical listeners are registered to the same event emitter with the same scope, the duplicates are
	 * discarded. They do not cause the listener to be notified of the same event twice, and since the duplicates are discarded,
	 * they do not need to be removed manually. When trying to register a diplucate, the bond returned while registering it the
	 * first time will be returned.
	 *
	 * @param {!string} eventType
	 * @param {function():*} listener
	 * @param {*=} scope
	 * @return {!Bond}
	 */
	EventEmitter.prototype["add"] = function(eventType, listener, scope) {
		// Determine the scope that will be passed to the bond, based on the passed scope and the target passed to the constructor.
		if (undefined === scope) {
			// If no specific scope is defined, not in the constructor nor in this function, use null as the scope.
			if (this == this.targetAndDefaultScope) {
				scope = null;
			// If no scope was defined to in this function, but a scope was defined in the constructor, use that scope.
			} else {
				scope = this.targetAndDefaultScope;
			}
		}
		// Find the bond bundle. Prefix "reserved" event types.
		if (emptyObject[eventType]) {
			var bonds = this.bondBundles[eventType = (reservedEventTypePrefix + eventType)];
		} else {
			var bonds = this.bondBundles[eventType];
		}
		var bond;
		// Create the bond bundle if it doesn't exist yet, and push a new bond to it.
		if (!bonds) {
			bonds = this.bondBundles[eventType] = [bond = new Bond(listener, scope)];
		// Push a new bond to the bond bundle, if such a bond bundle existed already.
		} else {
			// However, if a bond with the passed listener and scope already exists, return it. Don't add a new bond.
			for (var index = 0; index < bonds.length; index++) {
				if (bonds[index].listener == listener) {
					bond = bonds[index];
					if (bond.originalScope === scope) {
						return bond;
					}
				}
			}
			bonds.push(bond = new Bond(listener, scope));
		}
		bond.bonds = bonds;
		// Return the bond.
		return bond;
	};
	/**
	 * Returns a copy of the passed array.
	 *
	 * @param {!Array} input
	 * @return {!Array}
	 */
	function copy(input) {
		return input.slice(0);
	}
	/**
	 * Emits an event. All the listeners that are registered to this event emitter for the passed event type will be notified.
	 *
	 * @param {!string} eventType
	 * @return {undefined}
	 */
	EventEmitter.prototype["emit"] = function(eventType) {
		// Find the bond bundle. Prefix "reserved" event types.
		if (emptyObject[eventType]) {
			var bonds = this.bondBundles[eventType = (reservedEventTypePrefix + eventType)];
		} else {
			var bonds = this.bondBundles[eventType];
		}
		if (bonds) {
			if (1 == bonds.length) {
				this.callingListener = bonds[0].callListener;
				this.callingListener();
			} else if (bonds.length /* To ensure not too much work is done if the bond bundle is empty. */) {
				// Copy the bond bundle, to make sure adding and removing bonds won't cause the lines below to behave unexpectedly.
				bonds = copy(bonds);
				// Call the listeners of the bonds.
				for (var index = 0; index < bonds.length; index++) {
					this.callingListener = bonds[index].callListener;
					this.callingListener();
				}
			}
			// Delete the temporary property.
			delete this.callingListener;
		}
	};
	/**
	 * Banana banana banana.
	 *
	 * @param {!string} eventType
	 * @param {!function():*} listener
	 * @param {*=} scope
	 * @return {undefined}
	 */
	EventEmitter.prototype["remove"] = function(eventType, listener, scope) {
		// Determine the scope that will be passed to the bond, based on the passed scope and the target passed to the constructor.
		if (undefined === scope) {
			// If no specific scope is defined, not in the constructor nor in this function, use null as the scope.
			if (this == this.targetAndDefaultScope) {
				scope = null;
			// If no scope was defined to in this function, but a scope was defined in the constructor, use that scope.
			} else {
				scope = this.targetAndDefaultScope;
			}
		}
		// Find the bond bundle. Prefix "reserved" event types.
		if (emptyObject[eventType]) {
			var bonds = this.bondBundles[eventType = (reservedEventTypePrefix + eventType)];
		} else {
			var bonds = this.bondBundles[eventType];
		}
		if (bonds) {
			for (var index = 0; index < bonds.length; index++) {
				if (bonds[index].listener == listener && bonds[index].originalScope === scope) {
					bonds.splice(index, 1);
					// As duplicates can't exist, return directly after a catch.
					return;
				}
			}
		}
	};
	// TODO: export the class
	/*if(typeof define === 'function' && define.amd) {
		define(function() {
			return EventEmitter;
		});
	}
	else {*/
		exports["EventEmitter"] = EventEmitter;
	//}
}(this));
