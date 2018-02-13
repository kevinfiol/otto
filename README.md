otto
===

Simple, lightweight, Vanilla JS autocomplete with no dependencies.

![NPM version](https://badge.fury.io/js/otto-complete.svg)

## Install

``` bash
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

Or forget NPM and importing/requiring and just include the .js file located [here](https://github.com/kevinfiol/otto/tree/master/lib)
``` html
<script src="./otto.min.js"></script>
```

You may include the optional styles also located [here](https://github.com/kevinfiol/otto/tree/master/lib).
They are only four lines. Here's a snippet of it for your convenience:
```css
.otto-div { border: 1px solid lightgrey; -webkit-transition: width 0.5s; transition: width 0.5s;  }
.otto-ul { padding: 0; margin: 0; }
.otto-li { padding: 2px; margin: 0; }
.otto-selected { background-color: #f2f2f2; }
```

## Usage

```js
// Choices array
var choices = ['apple', 'banana', 'avocado', 'tomato', 'kiwi'];

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

	// Default is false; use if you only want to match full words	
	matchFullWord: true,

	// A callback function to execute upon hitting the Enter Key
	// It takes one argument, which is the the event object.
	// Note: This callback will be triggered on the 'keydown' event, and only executes when the dropdown is hidden
	enterEvent: null,

	// A callback function to execute when the value of the input is changed
	// It takes one argument, which is the current value of the input field
	// Note: This callback will be triggered on the 'input' event
	valueEvent: null,

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