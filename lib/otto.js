(function() {
    'use strict';

    var Otto = (function() {
        var MIN_CHARS = 3;
        var MAX_RESULTS = 7;

        function Otto(root, config, choices) {
            // Config
            this.config = config;

            // Data
            this.inputValue = '';
            this.selected = null;
            this.allChoices = choices || [];
            this.filteredChoices = [];

            // Initialize Root
            this.root = initRoot.call(this, root);
        
            // Create Dropdown Div
            this.dropDown = Dropdown(
                this.root.getBoundingClientRect(),
                config.divClass || ''
            );
        
            // Create List Element & Append to Dropdown
            this.ulElement = UnorderedList(config.ulClass || '');
            this.dropDown.appendChild(this.ulElement);
        
            // Insert Dropdown Element after Input Element
            this.root.insertAdjacentElement('afterend', this.dropDown);
        
            /**
             * List Filtering Functions
             */
            this.applyFilter = function() {
                var emText = [];
                var maxResults = this.config.maxResults || MAX_RESULTS;
                this.filteredChoices = [];

                var temp = this.allChoices.filter(function(str) {
                    // Find Index
                    var index = str.toUpperCase().indexOf(this.inputValue.toUpperCase());

                    // Determine if to check for full word,
                    // If yes, evaluate boolean
                    // Else, just return true (meaning DONT check for full word)
                    var matchFullWord = (this.config.matchFullWord || false)
                        ? str[index - 1] === undefined || str[index - 1] == ' '
                        : true
                    ;
                    
                    if (index > -1 && matchFullWord) {
                        emText.push({index: index, len: this.inputValue.length});
                        return true;
                    }
                }.bind(this));

                // Apply emphasis on matched text
                for (var i = 0; i < Math.min(maxResults, temp.length); i++) {
                    this.filteredChoices.push(
                        temp[i].slice(0, emText[i].index)
                            + '<b>'
                            + temp[i].slice(emText[i].index, emText[i].index + emText[i].len)
                            + '</b>'
                            + temp[i].slice(emText[i].index + emText[i].len)
                    );
                }
            };

            this.clearSelected = function() {
                var els = document.getElementsByClassName('otto-li selected');
                if (els.length > 0) {
                    els[0].className = els[0].className.replace(' selected', '');
                }
            };
        
            this.updateList = function() {
                this.ulElement.innerHTML = '';

                this.filteredChoices.forEach(function(choice) {
                    var liElement = ListElement.call(this, choice, config.liClass || '');
                    this.ulElement.appendChild(liElement);
                }.bind(this));

                if (this.filteredChoices.length < 1) {
                    this.dropDown.hidden = true;
                } else {
                    this.dropDown.hidden = false;
                }
            };
        
            /**
             * Initial List Call
             */
            this.updateList();
        }

        function initRoot(rootEl) {
            var root = rootEl;
            root.autocomplete = 'off';

            var handleInput = function(ev) {
                var minChars = this.config.minChars || MIN_CHARS;
                var sourceFunction = this.config.source || null;
                this.inputValue = ev.target.value;

                // User-defined valueEvent
                if (this.config.valueEvent) {
                    this.config.valueEvent(this.inputValue);
                }

                if (this.inputValue.length >= minChars) {
                    // If sourceFunction is not null, call user-defined
                    // callback, else fall back on current array
                    // of this.allChoices & applyFilter + updateList
                    if (sourceFunction !== null) {
                        // sourceFunction takes input value
                        // and 'done' callback
                        sourceFunction(this.inputValue, function(res) {
                            this.allChoices = res || [];
                            // This check to prevent the list from being updated
                            // When the user has already emptied the input field
                            if (this.inputValue.length > 0) {
                                this.applyFilter();
                                this.updateList();
                            }
                        }.bind(this));
                    } else {
                        // Just work with current this.allChoices
                        this.applyFilter();
                        this.updateList();
                    }
                } else {
                    this.filteredChoices = [];
                    this.updateList();
                }
            }.bind(this);

            var handleEnter = function(ev) {
                if (this.selected !== null) {
                    this.inputValue = root.value = this.selected;
                    // call User-defined valueEvent
                    if (this.config.valueEvent) {
                        this.config.valueEvent(this.inputValue);
                    }
                }

                // Only trigger User-defined Enter Event if dropDown is hidden
                if (this.config.enterEvent && this.dropDown.hidden == true) {
                    this.config.enterEvent(ev);
                }

                this.dropDown.hidden = true;
            }.bind(this);

            var handleUpDown = function(ev) {
                var els = document.getElementsByClassName('otto-li');
                var elsLen = els.length;
                var selected = null;

                if (elsLen > 0) {
                    // Find Index of Currently Selected li
                    for (var i = 0; i < elsLen; i++) {
                        if (els[i].className.indexOf('selected') > -1) {
                            selected = i;
                        }
                    }
        
                    if (ev.keyCode == 40) {
                        // Down
                        if (selected !== null && selected < elsLen - 1) {
                            els[selected].className = els[selected].className.replace(' selected', '');
                            els[selected + 1].className += ' selected';
                            this.selected = els[selected + 1].innerText;
                        } else if (selected === null) {
                            els[0].className += ' selected';
                            this.selected = els[0].innerText;
                        }
                    } else if (ev.keyCode == 38) {
                        // Up
                        if (selected !== null && selected > 0) {
                            els[selected].className = els[selected].className.replace(' selected', '');
                            els[selected - 1].className += ' selected';
                            this.selected = els[selected - 1].innerText;
                        }
                    }
                }
            }.bind(this);

            root.onkeydown = function(ev) {
                // Call User-Defined Event
                this.config.events && this.config.events.onkeydown
                    ? this.config.events.onkeydown(ev)
                    : null
                ;
                // Default Event
                if (ev.keyCode == 38 || ev.keyCode == 40) {
                    ev.preventDefault();
                    handleUpDown(ev);
                } else if (ev.keyCode == 13) {
                    ev.preventDefault();
                    handleEnter(ev);
                }
            }.bind(this);

            root.oninput = function(ev) {
                // User-Defined Event
                this.config.events && this.config.events.oninput
                    ? this.config.events.oninput(ev)
                    : null
                ;
                // Default Event
                handleInput(ev);
            }.bind(this);
        
            root.onfocus = function() {
                // User-Defined Event
                this.config.events && this.config.events.onfocus
                    ? this.config.events.onfocus(ev)
                    : null
                ;
                // Default Event
                if (this.filteredChoices.length > 0) {
                    this.dropDown.hidden = false;
                }
            }.bind(this);
        
            root.onblur = function() {
                // User-Defined Event
                this.config.events && this.config.events.onblur
                    ? this.config.events.onblur(ev)
                    : null
                ;
                // Default Event
                setTimeout(function() {
                    this.dropDown.hidden = true;
                }.bind(this), 100);
            }.bind(this);

            // All Other User-Defined Events
            if (this.config.events) {
                Object.keys(this.config.events).forEach(function(key) {
                    if (['onkeydown', 'oninput', 'onblur', 'onfocus'].indexOf(key) <= -1) {
                        root[key] = this.config.events[key];
                    }
                }.bind(this));
            }

            return root;
        }

        function Dropdown(rootRect, customClass) {
            var dropDown = document.createElement('div');
            dropDown.className = 'otto-div' + ' ' + customClass;
            dropDown.style.width = (rootRect.width).toString() + 'px'; // compensate for border
            dropDown.style.top = (rootRect.height + rootRect.top + 2).toString() + 'px';
            dropDown.style.backgroundColor = 'white';
            dropDown.style.position = 'absolute';
            dropDown.style.zIndex = '9999';
            dropDown.hidden = true;
            return dropDown;
        }

        function UnorderedList(customClass) {
            var ulElement = document.createElement('ul');
            ulElement.className = 'otto-ul' + ' ' + customClass;
            return ulElement;
        }

        function ListElement(choice, customClass) {
            var liElement = document.createElement('li');
            liElement.className = 'otto-li' + ' ' + customClass;
            liElement.style.listStyleType = 'none';
            liElement.innerHTML = choice;
            liElement.style.cursor = 'default';

            liElement.addEventListener('mouseenter', function(ev) {
                this.clearSelected();
                ev.target.className += ' selected';
                this.selected = ev.target.innerText;
            }.bind(this));

            liElement.addEventListener('mouseleave', function(ev) {
                ev.target.className = ev.target.className.replace(' selected', '');
                this.selected = null;
            }.bind(this));

            liElement.onclick = function() {
                this.inputValue = this.root.value = this.selected;
                this.filteredChoices = [];
                // Call User-defined Value Event
                if (this.config.valueEvent) {
                    this.config.valueEvent(this.inputValue);
                }
            }.bind(this);

            return liElement;
        }

        return Otto;
    })();

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Otto;
    } else {
        var main = (this || (typeof window !== 'undefined' ? window : global));
        main.Otto = Otto;
    }
})();