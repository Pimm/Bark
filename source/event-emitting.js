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
/**
 * Whether Bark should include debug information.
 *
 * @define {boolean}
 */
var debug = true;
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
	 * @param {!EventEmitter} eventEmitter
	 */
	function Bond(listener, scope, eventEmitter) {
		// Define a callListener property, which is a callListener property that respects the scope.
		if (null === (this.originalScope = scope)) {
			this.callListener = (this.listener = listener);
		} else {
			this.callListener = jurassic ? bindListener(this.listener = listener, scope) : (this.listener = listener).bind(scope);
		}
		this.eventEmitter = eventEmitter;
	}
	/**
	 * Like EventEmitter.prototype.add, except that it returns a bond that represents both the newely created bond as well as the
	 * bond this is called on.
	 *
	 * @param {!string} eventType
	 * @param {function():*} listener
	 * @param {*=} scope
	 * @return {!Bond}
	 */
	Bond.prototype["add"] = function(eventType, listener, scope) {
		return new CompositeBond(this, this.eventEmitter["add"](eventType, listener, scope));
	};
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
	 * Tears down a bond. Overwrites the destroy method so it can't be called anymore, and deletes the references to the
	 * listeners and scopes.
	 *
	 * @param {!Bond} bond
	 * @return {undefined}
	 */
	function tearDown(bond) {
		// Delete the references to the listener, potentially allowing the listener to be garbage collected.
		delete bond.listener;
		delete bond.callListener;
		// The same goes for the scope. Perhaps this aides the garbage collection process.
		delete bond.originalScope;
		// Overwrite the destroy method, so calling it will have no effect.
		bond["destroy"] = nop;
	}
	/**
	 * Destroys the bond. The event emitter will no longer notify the listener. Bonds cannot be "undestroyed".
	 *
	 * @return {undefined}
	 */
	Bond.prototype["destroy"] = function() {
		tearDown(this.bonds.splice(jurassic ? find(this.bonds, this) : this.bonds.lastIndexOf(this), 1)[0]);
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
		var callOriginalListener = this.callListener;
		// Overwrite the callListener property, so the destroy method gets called when the listener is called.
		this.callListener = function() {
			bond["destroy"]();
			callOriginalListener.call(this);
		};
		// Two notes.
		// If destroyOnUse was already called on this bond, calling the callListener property will attempt to destroy the bond
		// twice. However, due to the implementation of the destroy method, that shouldn't be a problem. A slight waste of memory
		// and processing power, sure, but no real problem.
		// If destroy was already called on this bond, the callListener property will be undefined. This causes the new/overwritten
		// callListener property to be a function that will throw an error. This shouldn't be a problem either either, as the
		// callListener property of a destroyed bond will never be used.
		return bond;
	};
	if (debug) {
		Bond.prototype.toString = function() {
			if (this["destroy"] === nop) {
				return "Bond(destroyed=true)";
			} else {
				return "Bond(destroyed=false)"
			}
		};
	}
	/**
	 * A null-object bond, that will be returned when null is passed as a listener.
	 *
	 * @constructor
	 * @extends Bond
	 * @param {!EventEmitter} eventEmitter
	 */
	function NullBond(eventEmitter) {
		this.eventEmitter = eventEmitter;
	}
	NullBond["prototype"] = {"add": function(eventType, listener, scope) {
		return this.eventEmitter["add"](eventType, listener, scope);
	}, "destroy": nop, "destroyOnUse": function() {
		return this;
	}};
	if (debug) {
		NullBond.prototype["toString"] = function() {
			return "NullBond";
		};
	}
	/**
	 * A composite bond. (The term "composite" somewhat similar to the way the Gang of Four defined it.)
	 *
	 * @constructor
	 * @extends Bond
	 * @param {!Bond} firstBond
	 * @param {!Bond} secondBond
	 */
	function CompositeBond(firstBond, secondBond) {
		this.firstBond = firstBond;
		this.secondBond = secondBond;
	}
	CompositeBond["prototype"] = {"add": function(eventType, listener, scope) {
		return new CompositeBond(this.firstBond, this.secondBond["add"](eventType, listener, scope));
	}, "destroy": function() {
		this.firstBond["destroy"]();
		this.secondBond["destroy"]();
	}, "destroyOnUse": function() {
		this.firstBond["destroyOnUse"]();
		this.secondBond["destroyOnUse"]();
		return this;
	}};
	if (debug) {
		CompositeBond.prototype.toString = function() {
			return "CompositeBond(firstBond=" + this.firstBond + ", secondBond=" + this.secondBond + ")";
		};
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
	 * they do not need to be removed manually. When trying to register a duplucate, the bond returned while registering it the
	 * first time will be returned.
	 *
	 * If the passed listener is null, no exception will be thrown. A valid bond will be returned.
	 *
	 * @param {!string} eventType
	 * @param {function():*} listener
	 * @param {*=} scope
	 * @return {!Bond}
	 */
	EventEmitter.prototype["add"] = function(eventType, listener, scope) {
		// If null is passed as the listener, a null-object bond is returned.
		if (null === listener) {
			if (this.nullBond) {
				return this.nullBond;
			} else {
				return this.nullBond = new NullBond(this);
			}
		}
		// Determine the scope that will be passed to the bond, based on the passed scope and the target passed to the constructor.
		if (undefined === scope) {
			// If no specific scope is defined, not in the constructor nor in this function, use null as the scope.
			if (this === this.targetAndDefaultScope) {
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
			bonds = this.bondBundles[eventType] = [bond = new Bond(listener, scope, this)];
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
			bonds.push(bond = new Bond(listener, scope, this));
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
	 * @return {{emit: !function(string)}}
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
		if (this.emitLink) {
			return this.emitLink;
		} else {
			return this.emitLink = {"emit": jurassic ? bindListener(this["emit"], this) : this["emit"].bind(this)};
		}
	};
	/**
	 * Banana banana banana.
	 *
	 * @param {!string} eventType
	 * @param {!function():*} listener
	 * @param {*=} scope
	 * @return {{remove: !function(!string, !function():*, *=)}}
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
					tearDown(bonds.splice(index, 1)[0]);
					// As duplicates can't exist, stop directly after a catch.
					break;
				}
			}
		}
		if (this.removeLink) {
			return this.removeLink;
		} else {
			return this.removeLink = {"remove": jurassic ? bindListener(this["remove"], this) : this["remove"].bind(this)};
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
