"use strict";
function createClickEvent() {
	var result = document.createEvent("HTMLEvents");
	result.initEvent("click", false, false);
	return result;
}
function createMoveEvent() {
	var result = document.createEvent("HTMLEvents");
	result.initEvent("mousemove", false, false);
	return result;
}
// Simple.
test("HTML add and emit test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clicked = false;
	button.eventEmitter.add("click", function() {
		clicked = true;
	});
	button.dispatchEvent(createClickEvent());
	strictEqual(clicked, true);
});
test("HTML bond destroying", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	var bond = button.eventEmitter.add("click", function() {
		clickCount++;
	});
	button.dispatchEvent(createClickEvent());
	bond.destroy();
	button.dispatchEvent(createClickEvent());
	// Call destroy again: calling it twice makes no sense, but it shouldn't be a problem either.
	bond.destroy();
	strictEqual(clickCount, 1);
	// Call destroyOnUse, just to make sure that doesn't produce a problem.
	bond.destroyOnUse();
});
test("HTML bond destroying on use", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	var bond = button.eventEmitter.add("click", function() {
		clickCount++;
	}).destroyOnUse();
	// Call destroyOnUse again: calling it twice makes no sense, but it shouldn't be a problem either.
	bond.destroyOnUse();
	button.dispatchEvent(createClickEvent());
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 1);
});
test("HTML add, emit and remove test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	var scope = {};
	button.eventEmitter.add("click", increaseClickCount, scope);
	button.dispatchEvent(createClickEvent());
	button.eventEmitter.remove("click", increaseClickCount, scope);
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 1);
});
test("HTML double-add, emit and remove test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	// Adding the same listener twice with the same scope should have the same effect as adding it once.
	button.eventEmitter.add("click", increaseClickCount);
	button.eventEmitter.add("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	button.eventEmitter.remove("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 1);
});
test("HTML add, emit and remove with clutter test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	function doNothing() {
	}
	button.eventEmitter.add("click", function() {
	});
	button.eventEmitter.add("click", increaseClickCount);
	button.eventEmitter.add("click", doNothing);
	button.eventEmitter.add("click", function() {
	});
	button.dispatchEvent(createClickEvent());
	button.eventEmitter.remove("click", doNothing);
	button.eventEmitter.remove("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 1);
});
test("HTML double-add with different scopes test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	button.eventEmitter.add("click", increaseClickCount);
	button.eventEmitter.add("click", increaseClickCount, {});
	button.dispatchEvent(createClickEvent());
	button.eventEmitter.remove("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 3);
});
test("HTML add and emit with event test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickEvent = null;
	button.eventEmitter.add("click", function(event) {
		clickEvent = event;
	});
	button.dispatchEvent(createClickEvent());
	strictEqual(clickEvent.type, "click");
});
// Chaining.
test("HTML chain-add test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	button.eventEmitter.add("click", function() {
		clickCount++;
	}, {}).add("click", function() {
		clickCount++;
	}, {}).add("click", function() {
		clickCount++;;
	}, {});
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 3);
});
test("HTML chained-bond destroying", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	var bond = button.eventEmitter.add("click", function() {
		clickCount++;
	}, {}).add("click", function() {
		clickCount++;
	}, {});
	button.dispatchEvent(createClickEvent());
	bond.destroy();
	button.dispatchEvent(createClickEvent());
	// Call destroy again: calling it twice makes no sense, but it shouldn't be a problem either.
	bond.destroy();
	strictEqual(clickCount, 2);
	// Call destroyOnUse, just to make sure that doesn't produce a problem.
	ok(bond === bond.destroyOnUse());
});
test("HTML chained-bond destroying on use", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	var moveCount = 0;
	var bond = button.eventEmitter.add("click", function() {
		clickCount++;
	}, {}).add("click", function() {
		clickCount++;
	}, {}).destroyOnUse();
	bond.add("mousemove", function() {
		moveCount++;
	}, {});
	// Call destroyOnUse again: calling it twice makes no sense, but it shouldn't be a problem either.
	ok(bond === bond.destroyOnUse());
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 2);
	strictEqual(moveCount, 0);
	button.dispatchEvent(createMoveEvent());
	strictEqual(clickCount, 2);
	strictEqual(moveCount, 1);
	button.dispatchEvent(createMoveEvent());
	strictEqual(clickCount, 2);
	strictEqual(moveCount, 2);
});
test("HTML chain-add, emit and chain-remove test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	var moveCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	function increaseMoveCount() {
		moveCount++;
	}
	button.eventEmitter.add("click", increaseClickCount).add("mousemove", increaseMoveCount);
	button.dispatchEvent(createClickEvent());
	button.dispatchEvent(createMoveEvent());
	button.eventEmitter.remove("click", increaseClickCount).remove("mousemove", increaseMoveCount);
	button.dispatchEvent(createClickEvent());
	button.dispatchEvent(createMoveEvent());
	strictEqual(clickCount, 1);
	strictEqual(moveCount, 1);
});
test("HTML chain-double-add, emit and remove test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	// Adding the same listener twice with the same scope should have the same effect as adding it once.
	button.eventEmitter.add("click", increaseClickCount).add("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	button.eventEmitter.remove("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 1);
});
test("HTML chain-double-add with different scopes test", function() {
	var button = document.createElement("a");
	button.eventEmitter = new HTMLEventEmitter(button);
	var clickCount = 0;
	function increaseClickCount() {
		clickCount++;
	}
	button.eventEmitter.add("click", increaseClickCount).add("click", increaseClickCount, {});
	button.dispatchEvent(createClickEvent());
	button.eventEmitter.remove("click", increaseClickCount);
	button.dispatchEvent(createClickEvent());
	strictEqual(clickCount, 3);
});
