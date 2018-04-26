otto
===

Simple, lightweight, Vanilla JS autocomplete with no dependencies.

![NPM version](https://badge.fury.io/js/otto-complete.svg)

## Install

```bash
npm install otto-complete --save
```

Then:
```js
var Otto = require('otto-complete');
```

Or if you're using ES6:
```js
import Otto from 'otto-complete';
```

Or if you're not using a package manager:
```html
<script src="https://unpkg.com/otto-complete/otto.min.js"></script>
```

You may include the optional styles also located [here](https://github.com/kevinfiol/otto/tree/master/lib).
They are only four lines. Here's a snippet of it for your convenience:
```css
.otto-ul { padding: 0; margin: 0; }
.otto-li { padding: 6px; margin: 0; }
.otto-selected { background-color: #f2f2f2; }
.otto-div { border: 1px solid lightgrey; -webkit-transition: all 0.5s; transition: all 0.5s; }
```

## Usage
Otto takes three arguments: an `input` HTML element, a `config` object, and a `choices` array.
```js
new Otto(inputElement, config, choices);
```

Choices **must be objects** with at the very least have a `label` attribute defined. If your choice objects only contain the `label` attribute, `value` and `matchOn` attributes will default to the `label` value.

Example:
```js
// Choices array
var choices = [
	{ label: 'apple' },
	{ label: 'kiwi' },
	{ label: 'banana' },
];

// Choices can also be object literals with custom properties
// `label` is required. Both `value` and `matchOn` are optional.
var otherChoices = [
	{
		// What the user sees
		label: 'apple',

		// What the input gets populated with upon selection
		value: 'A red delicious fruit',

		// What Otto will match on
		matchOn: 'apple APPLE red fruit grannysmith'
	},

	// Extra attributes can be added to your choice objects for use
	// In custom renderItem or selectEvents.
	{ label: 'banana', value: 'Monkey Bananas', matchOn: 'monkey yellow banana', bananaCode: 52 }
];

// Config Object (Optional)
var config = {
	// Minimum characters before results are filtered; Default is 3
	minChars: 2,

	// Maximum results to display; Default is 7		
	maxResults: 5,

	// Append custom class to div container	
	divClass: 'myDivClass'

	// Append custom class to ul element
	ulClass: 'myUlClass'

	// Append custom class to all li elements	
	liClass: 'myLiClass'

	// Match only full words. Default is false.
	matchFullWord: true,

	// Enter Event. A callback function to execute upon hitting the Enter Key.
	// It takes one argument, which is the the event object.
	// Note: This callback will be triggered on the 'keyup' event, and only executes when the dropdown is hidden
	enterEvent: function(ev) {
		myFormElement.submit();
	},

	// Value Event. A callback function to execute when the value of the input is changed
	// It takes one argument, which is the current value of the input field
	// Note: This callback will be triggered on the 'input' event, 'enter' event, and when a dropdown item is selected.
	valueEvent: function(value) {
		myOuterVariable = value;
	},

	// Render Item. Customize the HTML for rendering dropdown items.
	// It takes one argument, which is the choice object
	renderItem: function(choice) {
		return choice.label + '<em>' + choice.value + '</em>';
	},

	// Select Event. A callback function to execute once a choice has been selected.
	// It takes one argument, which is the choice object
	selectEvent: function(choice) {
		console.log('Label + Value', choice.label + choice.value);
	},

	// A convenience property; Use this object to add additional event listeners to the input element
	// E.g., events: { click: function(ev) { console.log('you clicked the input box!'); } }
	events: {},

	// Source Callback Function: Used in case you'd like to dynamically retrieve results via an XMLHttpRequest, f.e.
	// This is called on every input except Enter, Up Arrow, and Down Arrow
	// It takes two arguments, `query` which is the current input value, and `done`, a callback that will update the prediction list
	source: null
};

// Initialize Otto instance
var otto = new Otto(document.getElementById('search'), config, choices);
```

**Note:** If a source array is not provided (such as in this example, `choices`), Otto will fall back on the source function passed inside the `config` object.

## Using `config.source`

The source function expects two arguments: `query`, which refers to the current input value, and `done`, which is a callback that expects the array of results to return.

Here's a simple, vanilla example:

```js
// Define Source Function
var sourceFunction = function(query, done) {
	var request = new XMLHttpRequest();
	request.open('GET', 'myAPI.php?query=' + query, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Request is OK!
			done(request.responseText);
		} else {
			// Something went wrong? Return empty array
			done([]);
		}
	}

	request.onerror = function() {
		// Error, Return empty array
		done([]);
	}

	request.send();
}

// Initialize Otto instance
var otto = new Otto(document.getElementById('search'), {
	source: sourceFunction
});
```