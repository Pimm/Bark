"use strict";
// Simple.
test("Add and emit test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barked = false;
	dog.eventEmitter.add("bark", function() {
		barked = true;
	});
	dog.eventEmitter.emit("bark");
	strictEqual(barked, true);
});
test("Bond destroying", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	var bond = dog.eventEmitter.add("bark", function() {
		barkCount++;
	});
	dog.eventEmitter.emit("bark");
	bond.destroy();
	dog.eventEmitter.emit("bark");
	// Call destroy again: calling it twice makes no sense, but it shouldn't be a problem either.
	bond.destroy();
	strictEqual(barkCount, 1);
	// Call destroyOnUse, just to make sure that doesn't produce a problem.
	ok(bond === bond.destroyOnUse());
});
test("Bond destroying on use", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	var bond = dog.eventEmitter.add("bark", function() {
		barkCount++;
	}).destroyOnUse();
	// Call destroyOnUse again: calling it twice makes no sense, but it shouldn't be a problem either.
	ok(bond === bond.destroyOnUse());
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 1);
});
test("Add, emit and remove test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	dog.eventEmitter.add("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.remove("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 1);
});
test("Double-add, emit and remove test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	// Adding the same listener twice with the same scope should have the same effect as adding it once, and both calls to the
	// add method should return the same bond.
	ok(dog.eventEmitter.add("bark", increaseBarkCount) === dog.eventEmitter.add("bark", increaseBarkCount));
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.remove("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 1);
});
test("Add, emit and remove with clutter test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	function doNothing() {
	}
	dog.eventEmitter.add("bark", function() {
	});
	dog.eventEmitter.add("bark", increaseBarkCount);
	dog.eventEmitter.add("bark", doNothing);
	dog.eventEmitter.add("bark", function() {
	});
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.remove("bark", doNothing);
	dog.eventEmitter.remove("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 1);
});
test("Double-add with different scopes test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	dog.eventEmitter.add("bark", increaseBarkCount);
	dog.eventEmitter.add("bark", increaseBarkCount, {});
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.remove("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 3);
});
// Chaining.
test("Chain-add and chain-emit test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	dog.eventEmitter.add("bark", function() {
		barkCount++;
	}, {}).add("bark", function() {
		barkCount++;
	}, {}).add("bark", function() {
		barkCount++;
	}, {});
	dog.eventEmitter.emit("bark").emit("bark");
	strictEqual(barkCount, 6);
});
test("Chained-bond destroying", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	var bond = dog.eventEmitter.add("bark", function() {
		barkCount++;
	}, {}).add("bark", function() {
		barkCount++;
	}, {});
	dog.eventEmitter.emit("bark");
	bond.destroy();
	dog.eventEmitter.emit("bark");
	// Call destroy again: calling it twice makes no sense, but it shouldn't be a problem either.
	bond.destroy();
	strictEqual(barkCount, 2);
	// Call destroyOnUse, just to make sure that doesn't produce a problem.
	ok(bond === bond.destroyOnUse());
});
test("Chained-bond destroying on use", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	var growlCount = 0;
	var bond = dog.eventEmitter.add("bark", function() {
		barkCount++;
	}, {}).add("bark", function() {
		barkCount++;
	}, {}).destroyOnUse();
	bond.add("growl", function() {
		growlCount++;
	}, {});
	// Call destroyOnUse again: calling it twice makes no sense, but it shouldn't be a problem either.
	ok(bond === bond.destroyOnUse());
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 2);
	strictEqual(growlCount, 0);
	dog.eventEmitter.emit("growl");
	strictEqual(barkCount, 2);
	strictEqual(growlCount, 1);
	dog.eventEmitter.emit("growl");
	strictEqual(barkCount, 2);
	strictEqual(growlCount, 2);
});
test("Chain-add, emit and chain-remove test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	var growlCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	function increaseGrowlCount() {
		growlCount++;
	}
	dog.eventEmitter.add("bark", increaseBarkCount).add("growl", increaseGrowlCount);
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.emit("growl");
	dog.eventEmitter.remove("bark", increaseBarkCount).remove("growl", increaseGrowlCount);
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.emit("growl");
	strictEqual(barkCount, 1);
	strictEqual(growlCount, 1);
});
test("Chain-double-add, emit and remove test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	// Adding the same listener twice with the same scope should have the same effect as adding it once.
	dog.eventEmitter.add("bark", increaseBarkCount).add("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.remove("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 1);
});
test("Chain-double-add with different scopes test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	function increaseBarkCount() {
		barkCount++;
	}
	dog.eventEmitter.add("bark", increaseBarkCount).add("bark", increaseBarkCount, {});
	dog.eventEmitter.emit("bark");
	dog.eventEmitter.remove("bark", increaseBarkCount);
	dog.eventEmitter.emit("bark");
	strictEqual(barkCount, 3);
});
// Advanced.
test("Listener scope test", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	// Use a new object as the initial value, to make sure no value can equal it.
	var firstScope = {};
	dog.eventEmitter.add("bark", function() {
		firstScope = this;
	});
	var secondScope = {};
	var desiredSecondScope = {};
	dog.eventEmitter.add("bark", function() {
		secondScope = this;
	}, desiredSecondScope);
	dog.eventEmitter.emit("bark");
	ok(firstScope === dog);
	ok(secondScope === desiredSecondScope);
	var anonymousEventEmitter = new EventEmitter();
	var thirdScope = {};
	anonymousEventEmitter.add("emit", function() {
		thirdScope = this;
	});
	anonymousEventEmitter.emit("emit");
	ok(thirdScope === anonymousEventEmitter);
});
// Edge cases.
test("Reserved event types", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var watched = false;
	// This line shouldn't cause anything out of the ordinary.
	dog.eventEmitter.emit("watch");
	dog.eventEmitter.add("watch", function() {
		watched = true;
	});
	dog.eventEmitter.emit("watch");
	strictEqual(watched, true);
	dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barked = false;
	var barkSound = "toString";
	// This line shouldn't cause anything out of the ordinary.
	dog.eventEmitter.emit(barkSound);
	dog.eventEmitter.add(barkSound, function() {
		barked = true;
	});
	dog.eventEmitter.emit(barkSound);
	ok(barked);
});
test("Null listener", function() {
	var dog = {};
	dog.eventEmitter = new EventEmitter(dog);
	var barkCount = 0;
	var bond = dog.eventEmitter.add("bark", null).add("bark", function() {
		barkCount++;
	}).add("bark", null);
	dog.eventEmitter.emit("bark");
	bond.destroyOnUse().destroy();
	strictEqual(barkCount, 1);
});
