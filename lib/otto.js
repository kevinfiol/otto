const MIN_CHARS   = 3;
const MAX_RESULTS = 7;

function Otto(root, config, choices) {
    this.config     = config || {};
    this.allChoices = choices || [];

    // Check parameters
    if (!this.isObject(this.config))
        throw 'Otto Error: `config` must be an object.';
    if (!Array.isArray(this.allChoices))
        throw 'Otto Error: `choices` must be an array of objects.';

    // Check choices list
    this.allChoices.forEach(c => {
        if (!this.isObject(c) || !c.label) {
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

    // For Testing / Browser Mocking
    this.window   = this.config.window || window;
    this.document = this.window.document;

    // Set Element references
    this.root     = this.createRoot(root);
    this.dropdown = this.createDropdown(this.root, this.config.divClass || '');
    this.ul       = this.createUnorderedList(this.config.ulClass || '');

    // Append ul to dropdown, and mount dropdown on root
    this.dropdown.appendChild(this.ul);
    this.root.insertAdjacentElement('afterend', this.dropdown);
    
    // Attached event listener for window resizing
    this.window.addEventListener('resize', () => this.setRedrawTimer());

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
    if (this.redrawTimer)
        clearTimeout(this.redrawTimer);

    this.redrawTimer = setTimeout(() => {
        this.dropdown.style.width = (this.root.offsetWidth).toString() + 'px';
        this.dropdown.style.top   = (this.root.offsetHeight + this.root.offsetTop + 2).toString() + 'px';
        this.dropdown.style.left  = (this.root.offsetLeft).toString() + 'px';
    }, 500);
};

Otto.prototype.applyFilter = function() {
    const val = this.inputValue.toUpperCase();
    const len = val.length;

    // Get all objects that match
    const matched = this.allChoices.filter(c => {
        const matchOn = c.matchOn || c.label;
        const index   = matchOn.toUpperCase().indexOf(val);

        // explain this better
        const matchFullWord = this.config.matchFullWord || false
            ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
            : true
        ;

        return index > -1 && matchFullWord;
    });

    this.filteredChoices = matched.map(c => {
        const result  = {};
        const emLabel = this.removeHTML(c.label);
        const emIndex = emLabel.toUpperCase().indexOf(val);

        // Set the label, and `value` values
        // `value` defaults to `label` if `value` was not passed
        result.label = c.label;
        result.value = c.value || c.label;

        // Construct label with emphasis on matched characters
        if (emIndex < 0) {
            result.emLabel = emLabel;
        } else {
            const beg = emLabel.slice(0, emIndex);
            const mid = emLabel.slice(emIndex, emIndex + len);
            const end = emLabel.slice(emIndex + len);
            result.emLabel = `${beg}<b>${mid}</b>${end}`;
        }

        // Append any extra properties from matched choice
        for (let key in c) {
            if (!result.hasOwnProperty(key)) result[key] = c[key];
        }

        return result;
    });
};

Otto.prototype.updateList = function() {
    // Clear ul
    this.ul.innerHTML = '';

    // Append all new items
    this.filteredChoices.forEach(c => {
        const li = this.createListElement(c, this.config.liClass || '');
        this.ul.appendChild(li);
    });

    // Hide if list is empty, else show it if the input field is active
    if (this.filteredChoices.length < 1) {
        this.dropdown.style.display = 'none';
    } else if (this.root === this.document.activeElement) {
        this.dropdown.style.display = '';
    }
};

Otto.prototype.fetchFromSource = function() {
    const key = this.inputValue.toUpperCase();

    // Check Cache First
    if (this.cache[key]) {
        this.allChoices = this.cache[key];
        this.applyFilter();
        this.updateList();
    } else {
        this.source(this.inputValue, res => {
            this.allChoices = res || [];
            this.cache[key] = [...this.allChoices];

            if (this.inputValue.length > 0) {
                this.applyFilter();
                this.updateList();
            }
        });
    }
};

Otto.prototype.handleInput = function(e) {
    this.inputValue = e.target.value;
    this.selected   = null;

    // Trigger optional valueEvent if present
    if (this.config.valueEvent)
        this.config.valueEvent(this.inputValue);
    
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
            this.config.valueEvent(this.inputValue);

        if (this.config.selectEvent)
            this.config.selectEvent(this.selected);
    }

    if (this.config.enterEvent && this.dropdown.style.display === 'none')
        this.config.enterEvent(e);

    this.dropdown.style.display = 'none';
};

Otto.prototype.handleUpDown = function(e) {
    const els = this.ul.getElementsByClassName('otto-li');
    const len = els.length;
    let idx   = null;
    let dir   = null;

    if (len > 0) {
        for (let i = 0; i < len; i++) {
            if (els[i].className.indexOf('otto-selected') > - 1) {
                idx = i;
            }
        }

        // Determine which direction
        if (e.keyCode == 40)
            dir = 1; // Down
        else if (e.keyCode == 38)
            dir = -1; // Up

        if (dir === 1 && idx === null) {
            // Select first entry
            els[0].className += ' otto-selected';
            this.selected    = els[0].choice;
        } else if (dir !== null) {
            if ((dir === 1 && idx < len - 1) || (dir === -1 && idx > 0)) {
                // The index of the to-be selected item
                let newIdx = idx + dir;
                els[idx].className = els[idx].className.replace(' otto-selected', '');
                els[newIdx].className += ' otto-selected';
                this.selected = els[newIdx].choice;
            }
        }
    }
};

Otto.prototype.clearSelected = function() {
    const els = this.ul.getElementsByClassName('otto-li otto-selected');
    if (els.length > 0) {
        els[0].className = els[0].className.replace(' otto-selected', '');
    }
};

/**
 * Element Creators
 */
Otto.prototype.createRoot = function(el) {
    const root = el;
    root.autocomplete = 'off';

    root.addEventListener('keydown', e => {
        if (e.keyCode == 38 || e.keyCode == 40) {
            e.preventDefault();
            this.handleUpDown(e);
        } else if (e.keyCode == 13) {
            // Prevents holding enter onkeydown
            // Causing repeated requests
            e.preventDefault();
        }
    });

    root.addEventListener('keyup', e => {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.handleEnter(e);
        }
    });

    root.addEventListener('input', e => {
        this.handleInput(e);
    });

    root.addEventListener('focus', () => {
        this.setRedrawTimer();
        if (this.filteredChoices.length > 0) {
            this.dropdown.style.display = '';
        }
    });

    root.addEventListener('blur', () => {
        this.dropdown.style.display = 'none';
    });

    // Custom Event Listeners
    if (this.config.events) {
        Object.keys(this.config.events).forEach(key => {
            root.addEventListener(key, this.config.events[key]);
        });
    }

    return root;
};

Otto.prototype.createDropdown = function(root, customClass) {
    var dd = this.document.createElement('div');
    dd.className = `otto-div ${customClass}`;
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
    const ul = this.document.createElement('ul');
    ul.className = `otto-ul ${customClass}`;
    return ul;
};

Otto.prototype.createListElement = function(choice, customClass) {
    const li = this.document.createElement('li');

    li.className = `otto-li ${customClass}`;
    li.choice    = choice;

    li.style.listStyleType = 'none';
    li.style.cursor = 'default';

    if (this.config.renderItem) {
        li.innerHTML = this.config.renderItem(choice);
    } else {
        li.innerHTML = choice.emLabel;
    }

    li.addEventListener('mouseenter', e => {
        this.clearSelected();
        e.target.className += ' otto-selected';
        this.selected = e.target.choice;
    });

    li.addEventListener('mouseleave', e => {
        e.target.className = e.target.className.replace(' otto-selected', '');
        this.selected = null;
    });

    li.addEventListener('mousedown', () => {
        this.inputValue = this.root.value = this.selected.value;
        this.filteredChoices = [];

        if (this.config.valueEvent)
            this.config.valueEvent(this.inputValue);

        if (this.config.selectEvent)
            this.config.selectEvent(this.selected);
    });

    return li;
};

module.exports = Otto;