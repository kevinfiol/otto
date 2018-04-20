(function () {
    'use strict';

    var Otto = (function () {
        var MIN_CHARS = 3;
        var MAX_RESULTS = 7;

        function Otto(root, config, choices) {
            this.config = config || {};
            this.allChoices = choices || [];

            if (this.config !== Object(this.config)) {
                throw 'Otto Error: config must be an object!';
            }

            if (!Array.isArray(this.allChoices)) {
                throw 'Otto Error: choices must be an array!';
            }

            // Data
            this.inputValue = '';
            this.selected = null;
            this.filteredChoices = [];
            this.cache = {};
            this.redrawTimer = null;

            // Initialize Root
            this.root = initRoot.call(this, root);

            // Create Dropdown Div
            this.dropDown = Dropdown(this.root, config.divClass || '');

            // Create List Element & Append to Dropdown
            this.ulElement = UnorderedList(config.ulClass || '');
            this.dropDown.appendChild(this.ulElement);

            // Insert Dropdown Element after Input Element
            this.root.insertAdjacentElement('afterend', this.dropDown);

            /**
             * Redraw Timer Function
             */
            this.setRedrawTimer = function () {
                if (this.redrawTimer) {
                    clearTimeout(this.redrawTimer);
                }

                this.redrawTimer = setTimeout(function () {
                    this.dropDown.style.width = (this.root.offsetWidth).toString() + 'px';
                    this.dropDown.style.top = (this.root.offsetHeight + this.root.offsetTop + 2).toString() + 'px';
                    this.dropDown.style.left = (this.root.offsetLeft).toString() + 'px';
                }.bind(this), 500);
            };

            // This Window Event Listener to detect when to resize dropDown
            window.addEventListener('resize', function () {
                this.setRedrawTimer();
            }.bind(this));

            /**
             * Remove HTML Entities
             */
            this.removeHTML = function(str) {
                return str.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
            };

            /**
             * List Filtering Functions
             */
            this.applyFilter = function () {
                var maxResults = this.config.maxResults || MAX_RESULTS;
                var inputVal = this.inputValue.toUpperCase();
                var inputLen = this.inputValue.length;

                // Empty Filter Choices
                this.filteredChoices = [];

                var emText = [];
                var tempChoices = [];


                for (var i = 0; i < this.allChoices.length; i++) {
                    var choice = this.allChoices[i];
                    var matchOn = null;
                    var label = null;

                    // Check if Object
                    if (choice === Object(choice)) {
                        if (choice.label) {
                            matchOn = label = choice.label
                        } else {
                            throw 'Otto Error: Invalid choice object! Must specify at least `label` attribute.'
                        }

                        if (choice.matchOn) matchOn = choice.matchOn;
                    } else {
                        label = matchOn = choice;
                    }

                    // Remove HTML Entities
                    label = this.removeHTML(label);

                    var matchOnIdx = matchOn.toUpperCase().indexOf(inputVal);
                    var labelIdx = label.toUpperCase().indexOf(inputVal);

                    // Determine if to check for full word,
                    // If yes, evaluate boolean
                    // Else, just return true (meaning DONT check for full word)
                    var matchFullWord = (this.config.matchFullWord || false)
                        ? matchOn[matchOnIdx - 1] === undefined || matchOn[matchOnIdx - 1] == ' '
                        : true
                        ;

                    if (matchOnIdx > -1 && matchFullWord) {
                        emText.push({ index: labelIdx, len: inputLen });
                        tempChoices.push(choice);
                    }
                }

                // Apply emphasis on matched text
                for (var i = 0; i < Math.min(maxResults, tempChoices.length); i++) {
                    var choiceLabel = null;

                    if (tempChoices[i] === Object(tempChoices[i])) {
                        if (!tempChoices[i].label) {
                            throw 'Otto Error: Invalid choice object!'
                        }

                        if (emText[i].index < 0) {
                            // No Emphasis Text, just append choice without bolding
                            this.filteredChoices.push({
                                value: tempChoices[i].value || tempChoices[i].label,
                                label: tempChoices[i].label
                            });

                            continue;
                        } else {
                            choiceLabel = tempChoices[i].label;
                        }
                    } else {
                        choiceLabel = tempChoices[i];
                    }

                    // Remove HTML Entities
                    choiceLabel = this.removeHTML(choiceLabel);

                    this.filteredChoices.push({
                        value: tempChoices[i].value || choiceLabel,
                        label: choiceLabel.slice(0, emText[i].index)
                            + '<b>'
                            + choiceLabel.slice(emText[i].index, emText[i].index + emText[i].len)
                            + '</b>'
                            + choiceLabel.slice(emText[i].index + emText[i].len)
                    });
                }
            };

            this.clearSelected = function () {
                var els = this.ulElement.getElementsByClassName('otto-li otto-selected');
                if (els.length > 0) {
                    els[0].className = els[0].className.replace(' otto-selected', '');
                }
            };

            this.updateList = function () {
                this.ulElement.innerHTML = '';

                this.filteredChoices.forEach(function (choiceObj) {
                    var liElement = ListElement.call(this, choiceObj, config.liClass || '');
                    this.ulElement.appendChild(liElement);
                }.bind(this));

                if (this.filteredChoices.length < 1) {
                    this.dropDown.style.display = 'none';
                } else if (this.root === document.activeElement) {
                    this.dropDown.style.display = '';
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

            var handleInput = function (ev) {
                var minChars = this.config.minChars || MIN_CHARS;
                var sourceFunction = this.config.source || null;
                this.inputValue = ev.target.value;
                this.selected = null;

                // User-defined valueEvent
                if (this.config.valueEvent) {
                    this.config.valueEvent(this.inputValue);
                }

                if (this.inputValue.length >= minChars) {
                    // Upper Case Input for caching purposes
                    var upperInput = this.inputValue.toUpperCase();

                    // If sourceFunction is not null, call user-defined
                    // callback, else fall back on current array
                    // of this.allChoices & applyFilter + updateList
                    if (sourceFunction !== null) {
                        if (this.cache[upperInput]) {
                            // First check if result is already cached
                            this.allChoices = this.cache[upperInput];
                            this.applyFilter();
                            this.updateList();
                        } else {
                            // sourceFunction takes input value
                            // and 'done' callback
                            sourceFunction(this.inputValue, function (res) {
                                this.allChoices = res || [];
                                this.cache[upperInput] = this.allChoices;
                                // This check to prevent the list from being updated
                                // When the user has already emptied the input field
                                if (this.inputValue.length > 0) {
                                    this.applyFilter();
                                    this.updateList();
                                }
                            }.bind(this));
                        }
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

            var handleEnter = function (ev) {
                if (this.selected !== null) {
                    this.inputValue = root.value = this.selected;
                    this.filteredChoices = [];
                    // call User-defined valueEvent
                    if (this.config.valueEvent) {
                        this.config.valueEvent(this.inputValue);
                    }
                }

                // Only trigger User-defined Enter Event if dropDown is hidden
                if (this.config.enterEvent && this.dropDown.style.display === 'none') {
                    this.config.enterEvent(ev);
                }

                this.dropDown.style.display = 'none';
            }.bind(this);

            var handleUpDown = function (ev) {
                var els = this.ulElement.getElementsByClassName('otto-li');
                var elsLen = els.length;
                var selected = null;

                if (elsLen > 0) {
                    // Find Index of Currently Selected li
                    for (var i = 0; i < elsLen; i++) {
                        if (els[i].className.indexOf('otto-selected') > -1) {
                            selected = i;
                        }
                    }

                    if (ev.keyCode == 40) {
                        // Down
                        if (selected !== null && selected < elsLen - 1) {
                            els[selected].className = els[selected].className.replace(' otto-selected', '');
                            els[selected + 1].className += ' otto-selected';
                            this.selected = els[selected + 1].dataValue;
                        } else if (selected === null) {
                            els[0].className += ' otto-selected';
                            this.selected = els[0].dataValue;
                        }
                    } else if (ev.keyCode == 38) {
                        // Up
                        if (selected !== null && selected > 0) {
                            els[selected].className = els[selected].className.replace(' otto-selected', '');
                            els[selected - 1].className += ' otto-selected';
                            this.selected = els[selected - 1].dataValue;
                        }
                    }
                }
            }.bind(this);

            root.addEventListener('keydown', function (ev) {
                if (ev.keyCode == 38 || ev.keyCode == 40) {
                    ev.preventDefault();
                    handleUpDown(ev);
                }

                // Prevents holding enter onkeydown
                // Causing repeated requests
                if (ev.keyCode == 13) {
                    ev.preventDefault();
                }
            }.bind(this));

            root.addEventListener('keyup', function (ev) {
                if (ev.keyCode == 13) {
                    ev.preventDefault();
                    handleEnter(ev);
                }
            }.bind(this));

            root.addEventListener('input', function (ev) {
                handleInput(ev);
            }.bind(this));

            root.addEventListener('focus', function () {
                // Redraw
                this.setRedrawTimer();
                if (this.filteredChoices.length > 0) {
                    this.dropDown.style.display = '';
                }
            }.bind(this));

            root.addEventListener('blur', function () {
                setTimeout(function () {
                    this.dropDown.style.display = 'none';
                }.bind(this), 500);
            }.bind(this));

            // All Other User-Defined Events
            if (this.config.events) {
                Object.keys(this.config.events).forEach(function (key) {
                    root.addEventListener(key, this.config.events[key]);
                }.bind(this));
            }

            return root;
        }

        function Dropdown(root, customClass) {
            var dropDown = document.createElement('div');
            dropDown.className = 'otto-div' + ' ' + customClass;
            dropDown.style.width = (root.offsetWidth).toString() + 'px'; // compensate for border
            dropDown.style.top = (root.offsetHeight + root.offsetTop + 2).toString() + 'px';
            dropDown.style.left = (root.offsetLeft).toString() + 'px';
            dropDown.style.backgroundColor = 'white';
            dropDown.style.position = 'absolute';
            dropDown.style.overflow = 'hidden';
            dropDown.style.zIndex = '9999';
            dropDown.style.display = 'none';
            return dropDown;
        }

        function UnorderedList(customClass) {
            var ulElement = document.createElement('ul');
            ulElement.className = 'otto-ul' + ' ' + customClass;
            return ulElement;
        }

        function ListElement(choiceObj, customClass) {
            var liElement = document.createElement('li');
            liElement.className = 'otto-li' + ' ' + customClass;
            liElement.style.listStyleType = 'none';
            liElement.dataValue = choiceObj.value;
            liElement.style.cursor = 'default';

            // Custom Item Render Function
            if (this.config.renderItem) {
                liElement.innerHTML = this.config.renderItem(choiceObj.label, choiceObj.value);
            } else {
                liElement.innerHTML = choiceObj.label;
            }

            liElement.addEventListener('mouseenter', function (ev) {
                this.clearSelected();
                ev.target.className += ' otto-selected';
                this.selected = ev.target.dataValue;
            }.bind(this));

            liElement.addEventListener('mouseleave', function (ev) {
                ev.target.className = ev.target.className.replace(' otto-selected', '');
                this.selected = null;
            }.bind(this));

            liElement.addEventListener('click', function () {
                this.inputValue = this.root.value = this.selected;
                this.filteredChoices = [];
                // Call User-defined Value Event
                if (this.config.valueEvent) {
                    this.config.valueEvent(this.inputValue);
                }
            }.bind(this));

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