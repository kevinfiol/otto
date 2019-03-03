'use strict';

var MIN_CHARS   = 3;
var MAX_RESULTS = 7;

function Otto(root, config, choices) {
    var this$1 = this;

    this.config     = config || {};
    this.allChoices = choices || [];

    // Check parameters
    if (!this.isObject(this.config))
        { throw 'Otto Error: `config` must be an object.'; }
    if (!Array.isArray(this.allChoices))
        { throw 'Otto Error: `choices` must be an array of objects.'; }

    // Check choices list
    this.allChoices.forEach(function (c) {
        if (!this$1.isObject(c) || !c.label) {
            throw 'Otto Error: All choices must be objects with a `label` attribute.';
        }
    });

    // After validating config object, set configurations or defaults
    this.inputValue      = '';
    this.selected        = null;
    this.filteredChoices = [];
    this.cache           = {};
    this.minChars        = this.config.minChars || MIN_CHARS;
    this.maxResults      = this.config.maxResults || MAX_RESULTS;
    this.source          = this.config.source || null;
    this.redrawTimer     = null;

    // Set Element references
    this.root     = this.createRoot(root);
    this.dropdown = this.createDropdown(this.root, this.config.divClass || '');
    this.ul       = this.createUnorderedList(this.config.ulClass || '');

    // Append ul to dropdown, and mount dropdown on root
    this.dropdown.appendChild(this.ul);
    this.root.insertAdjacentElement('afterend', this.dropdown);
    
    // Attached event listener for window resizing
    window.addEventListener('resize', function () { return this$1.setRedrawTimer(); });

    // Initial updateList call
    this.updateList();
}

Otto.prototype.isObject = function(x) {
    return (x !== null) && (x.constructor === Object);
};

Otto.prototype.removeHTML = function(s) {
    return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
};

Otto.prototype.setRedrawTimer = function() {
    var this$1 = this;

    if (this.redrawTimer)
        { clearTimeout(this.redrawTimer); }

    this.redrawTimer = setTimeout(function () {
        this$1.dropdown.style.width = (this$1.root.offsetWidth).toString() + 'px';
        this$1.dropdown.style.top   = (this$1.root.offsetHeight + this$1.root.offsetTop + 2).toString() + 'px';
        this$1.dropdown.style.left  = (this$1.root.offsetLeft).toString() + 'px';
    }, 500);
};

Otto.prototype.applyFilter = function() {
    var this$1 = this;

    var val = this.inputValue.toUpperCase();
    var len = val.length;

    // Get all objects that match
    var matched = this.allChoices.filter(function (c) {
        var matchOn = c.matchOn || c.label;
        var index   = matchOn.toUpperCase().indexOf(val);

        // explain this better
        var matchFullWord = this$1.config.matchFullWord || false
            ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
            : true
        ;

        return index > -1 && matchFullWord;
    });

    this.filteredChoices = matched.map(function (c) {
        var result  = {};
        var emLabel = this$1.removeHTML(c.label);
        var emIndex = emLabel.toUpperCase().indexOf(val);

        // Set the label, and `value` values
        // `value` defaults to `label` if `value` was not passed
        result.label = c.label;
        result.value = c.value || c.label;

        // Construct label with emphasis on matched characters
        if (emIndex < 0) {
            result.emLabel = emLabel;
        } else {
            var beg = emLabel.slice(0, emIndex);
            var mid = emLabel.slice(emIndex, emIndex + len);
            var end = emLabel.slice(emIndex + len);
            result.emLabel = beg + "<b>" + mid + "</b>" + end;
        }

        // Append any extra properties from matched choice
        for (var key in c) {
            if (!result.hasOwnProperty(key)) { result[key] = c[key]; }
        }

        return result;
    });
};

Otto.prototype.updateList = function() {
    var this$1 = this;

    // Clear ul
    this.ul.innerHTML = '';

    // Append all new items
    this.filteredChoices.forEach(function (c) {
        var li = this$1.createListElement(c, this$1.config.liClass || '');
        this$1.ul.appendChild(li);
    });

    // Hide if list is empty, else show it if the input field is active
    if (this.filteredChoices.length < 1) {
        this.dropdown.style.display = 'none';
    } else if (this.root === document.activeElement) {
        this.dropdown.style.display = '';
    }
};

Otto.prototype.fetchFromSource = function() {
    var this$1 = this;

    var key = this.inputValue.toUpperCase();

    // Check Cache First
    if (this.cache[key]) {
        this.allChoices = this.cache[key];
        this.applyFilter();
        this.updateList();
    } else {
        this.source(this.inputValue, function (res) {
            this$1.allChoices = res || [];
            this$1.cache[key] = [].concat( this$1.allChoices );

            if (this$1.inputValue.length > 0) {
                this$1.applyFilter();
                this$1.updateList();
            }
        });
    }
};

Otto.prototype.handleInput = function(e) {
    this.inputValue = e.target.value;
    this.selected   = null;

    // Trigger optional valueEvent if present
    if (this.config.valueEvent)
        { this.config.valueEvent(this.inputValue); }
    
    if (this.inputValue.length >= this.minChars) {
        // Check if there is a source
        if (this.config.source) {
            this.fetchFromSource();
        } else {
            this.applyFilter();
            this.updateList();
        }
    } else {
        this.filteredChoices = [];
        this.updateList();
    }
};

Otto.prototype.handleEnter = function(e) {
    if (this.selected) {
        this.inputValue = this.root.value = this.selected.value;
        this.filteredChoices = [];

        if (this.config.valueEvent)
            { this.config.valueEvent(this.inputValue); }

        if (this.config.selectEvent)
            { this.config.selectEvent(this.selected); }
    }

    if (this.config.enterEvent && this.dropdown.style.display === 'none')
        { this.config.enterEvent(e); }

    this.dropdown.style.display = 'none';
};

Otto.prototype.handleUpDown = function(e) {
    var els = this.ul.getElementsByClassName('otto-li');
    var len = els.length;
    var idx   = null;
    var dir   = null;

    if (len > 0) {
        for (var i = 0; i < len; i++) {
            if (els[i].className.indexOf('otto-selected') > - 1) {
                idx = i;
            }
        }

        // Determine which direction
        if (e.keyCode == 40)
            { dir = 1; } // Down
        else if (e.keyCode == 38)
            { dir = -1; } // Up

        if (dir === 1 && idx === null) {
            // Select first entry
            els[0].className =+ ' otto-selected';
            this.selected    = els[0].choice;
        } else if (dir !== null) {
            // The index of the to-be selected item
            var newIdx = idx + dir;

            els[idx].className = els[idx].className.replace(' otto-selected', '');
            els[newIdx].className += ' otto-selected';
            this.selected = els[newIdx].choice;
        }
    }
};

Otto.prototype.clearSelected = function() {
    var els = this.ul.getElementsByClassName('otto-li otto-selected');
    if (els.length > 0) {
        els[0].className = els[0].className.replace(' otto-selected', '');
    }
};

/**
 * Element Creators
 */
Otto.prototype.createRoot = function(el) {
    var this$1 = this;

    var root = el;
    root.autocomplete = 'off';

    root.addEventListener('keydown', function (e) {
        if (e.keyCode == 38 || e.keyCode == 40) {
            e.preventDefault();
            this$1.handleUpDown(e);
        } else if (e.keyCode == 13) {
            // Prevents holding enter onkeydown
            // Causing repeated requests
            e.preventDefault();
        }
    });

    root.addEventListener('keyup', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            this$1.handleEnter(e);
        }
    });

    root.addEventListener('input', function (e) {
        this$1.handleInput(e);
    });

    root.addEventListener('focus', function () {
        this$1.setRedrawTimer();
        if (this$1.filteredChoices.length > 0) {
            this$1.dropdown.style.display = '';
        }
    });

    root.addEventListener('blur', function (e) {
        this$1.dropdown.style.display = 'none';
    });

    // Custom Event Listeners
    if (this.config.events) {
        Object.keys(this.config.events).forEach(function (key) {
            root.addEventListener(key, this$1.config.events[key]);
        });
    }

    return root;
};

Otto.prototype.createDropdown = function(root, customClass) {
    var dd = document.createElement('div');
    dd.className = "otto-dev " + customClass;
    dd.style.width = (root.offsetWidth).toString() + 'px'; // compensate for border
    dd.style.top = (root.offsetHeight + root.offsetTop + 2).toString() + 'px';
    dd.style.left = (root.offsetLeft).toString() + 'px';
    dd.style.backgroundColor = 'white';
    dd.style.position = 'absolute';
    dd.style.overflow = 'hidden';
    dd.style.zIndex = '9999';
    dd.style.display = 'none';
    return dd;
};

Otto.prototype.createUnorderedList = function(customClass) {
    var ul = document.createElement('ul');
    ul.className = "otto-ul " + customClass;
    return ul;
};

Otto.prototype.createListElement = function(choice, customClass) {
    var this$1 = this;

    var li = document.createElement('li');

    li.className = "otto-li " + customClass;
    li.choice    = choice;

    li.style.listStyleType = 'none';
    li.style.cursor = 'default';

    if (this.config.renderItem) {
        li.innerHTML = this.config.renderItem(choice);
    } else {
        li.innerHTML = choice.emLabel;
    }

    li.addEventListener('mouseenter', function (e) {
        this$1.clearSelected();
        e.target.className += ' otto-selected';
        this$1.selected = e.target.choice;
    });

    li.addEventListener('mouseleave', function (e) {
        e.target.className = e.target.className.replace(' otto-selected', '');
        this$1.selected = null;
    });

    li.addEventListener('mousedown', function () {
        this$1.inputValue = this$1.root.value = this$1.selected.value;
        this$1.filteredChoices = [];

        if (this$1.config.valueEvent)
            { this$1.config.valueEvent(this$1.inputValue); }

        if (this$1.config.selectEvent)
            { this$1.config.selectEvent(this$1.selected); }
    });

    return li;
};

module.exports = Otto;
