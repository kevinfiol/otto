otto
===

Simple, lightweight, Vanilla JS autocomplete with no dependencies.

![NPM version](https://badge.fury.io/js/otto-complete.svg)

## Install

``` bash
npm install otto-complete --save
```

Or just include the .js file
``` html
<script src="./otto.min.js"></script>
```

## Usage

```js
// Choices array
var fruits = ['apple', 'banana', 'avocado', 'tomato', 'kiwi'];

// Config Object (Optional)
var config = { 
	minChars: 2,			// Default is 3
	maxResults: 5,			// Default is 7
	divClass: 'myDivClass'	// Append custom class to div container
	ulClass: 'myUlClass'	// Append custom class to ul element
	liClass: 'myLiClass'	// Append custom class to all li elements
	matchFullWord: true		// Default is false; use if you only want to match full words
	source: null			// Source Function: Used in case you'd like to dynamically retrieve results via XHR, f.e.
								// This is called on every key press
};

// Initialize Otto instance
var otto = new Otto(document.getElementById('search'), config, fruits);
```

**Note:** If a source array is not provided (such as in this example, `fruits`), Otto will fall back on the source function passed inside the `config` object.