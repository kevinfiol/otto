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

	// Source Function: Used in case you'd like to dynamically retrieve results via an XMLHttpRequest, f.e.
	// This is called on every keypress except Enter, Up Arrow, and Down Arrow
	source: null
};

// Initialize Otto instance
var otto = new Otto(document.getElementById('search'), config, fruits);
```

**Note:** If a source array is not provided (such as in this example, `fruits`), Otto will fall back on the source function passed inside the `config` object.