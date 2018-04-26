(function () {
    'use strict';

    var MIN_CHARS = 3;
    var MAX_RESULTS = 7;

    var Otto = function(root, config, choices) {
        var state = {
            config: null,
            allChoices: null,
            filteredChoices: [],
            maxResults: null,
            minChars: null,
            source: null,

            inputValue: '',
            selected: null,
            cache: {},
            redrawTimer: null,

            root: null,
            dropdown: null,
            ul: null,

            setRedrawTimer: null,
            applyFilter: null,
            clearSelected: null,
            updateList: null
        };

        state.config = config || {};
        state.allChoices = choices || [];

        if (state.config !== Object(state.config)) throw 'Otto Error: config must be an object.';
        if (!Array.isArray(state.allChoices)) throw 'Otto Error: choices must be an array of objects.';

        state.allChoices.forEach(function(choice) {
            if (choice !== Object(choice) || !choice.label) {
                throw 'Otto Error; All choices must be objects with a `label` attribute.';
            }
        });

        state.minChars = state.config.minChars || MIN_CHARS;
        state.maxResults = state.config.maxResults || MAX_RESULTS;
        state.source = state.config.source || null;

        state.root = Root(root);
        state.dropdown = Dropdown(state.root, state.config.divClass || '');
        state.ul = UnorderedList(state.config.ulClass || '');

        state.dropdown.appendChild(state.ul);
        state.root.insertAdjacentElement('afterend', state.dropdown);

        state.setRedrawTimer = function() {
            if (state.redrawTimer) {
                clearTimeout(state.redrawTimer);
            }

            state.redrawTimer = setTimeout(function() {
                state.dropdown.style.width = (state.root.offsetWidth).toString() + 'px';
                state.dropdown.style.top = (state.root.offsetHeight + state.root.offsetTop + 2).toString() + 'px';
                state.dropdown.style.left = (state.root.offsetLeft).toString() + 'px';
            }, 500);
        };

        state.applyFilter = function() {
            var input = state.inputValue.toUpperCase();
            var inputLen = input.length;

            var matched = state.allChoices.filter(function(choice) {
                var matchOn = choice.label;
                if (choice.matchOn) matchOn = choice.matchOn;

                var index = matchOn.toUpperCase().indexOf(input);

                var matchFullWord = (state.config.matchFullWord || false)
                    ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
                    : true
                ;

                return index > -1 && matchFullWord;
            });

            state.filteredChoices = matched.map(function(choice) {
                var result = {};
                var emLabel = removeHTML(choice.label);
                var emIdx = emLabel.toUpperCase().indexOf(input);

                result.label = choice.label;
                result.value = choice.value || choice.label;

                if (emIdx < 0) {
                    result.emLabel = emLabel;
                } else {
                    result.emLabel = emLabel.slice(0, emIdx)
                        + '<b>' + emLabel.slice(emIdx, emIdx + inputLen)
                        + '</b>' + emLabel.slice(emIdx + inputLen)
                    ;
                }

                for (var attr in choice) {
                    if (!result.hasOwnProperty(attr)) {
                        result[attr] = choice[attr];
                    }
                }

                return result;
            });
        };

        state.clearSelected = function() {
            var els = state.ul.getElementsByClassName('otto-li otto-selected');
            if (els.length > 0) {
                els[0].className = els[0].className.replace(' otto-selected', '');
            }
        };

        state.updateList = function() {
            state.ul.innerHTML = '';
            state.filteredChoices.forEach(function(choice) {
                var li = ListElement(choice, state.config.liClass || '');
                state.ul.appendChild(li);
            });

            if (state.filteredChoices.length < 1) {
                state.dropdown.style.display = 'none';
            } else if (state.root === document.activeElement) {
                state.dropdown.style.display = '';
            }
        };

        window.addEventListener('resize', function() {
            state.setRedrawTimer();
        });

        function Root(el) {
            var root = el;
            root.autocomplete = 'off';
    
            function handleInput(ev) {
                state.inputValue = ev.target.value;
                state.selected = null;
    
                if (state.config.valueEvent) state.config.valueEvent(state.inputValue);
    
                if (state.inputValue.length >= state.minChars) {
                    var upperInput = state.inputValue.toUpperCase();
    
                    if (state.config.source) {
                        if (state.cache[upperInput]) {
                            state.allChoices = state.cache[upperInput];
                            state.applyFilter();
                            state.updateList();
                        } else {
                            state.source(state.inputValue, function(res) {
                                state.allChoices = res || [];
                                state.cache[upperInput] = state.allChoices;
    
                                if (state.inputValue.length > 0) {
                                    state.applyFilter();
                                    state.updateList();
                                }
                            });
                        }
                    } else {
                        state.applyFilter();
                        state.updateList();
                    }
                } else {
                    state.filteredChoices = [];
                    state.updateList();
                }
            }
    
            function handleEnter(ev) {
                if (state.selected) {
                    state.inputValue = root.value = state.selected.value;
                    state.filteredChoices = [];
    
                    if (state.config.valueEvent) {
                        state.config.valueEvent(state.inputValue);
                    }
    
                    if (state.config.selectEvent) {
                        state.config.selectEvent(state.selected);
                    }
                }
    
                if (state.config.enterEvent && state.dropdown.style.display === 'none') { 
                    state.config.enterEvent(ev);
                }
    
                state.dropdown.style.display = 'none';
            }
    
            function handleUpDown(ev) {
                var els = state.ul.getElementsByClassName('otto-li');
                var elsLen = els.length;
                var idx = null;
    
                if (elsLen > 0) {
                    for (var i = 0; i < elsLen; i++) {
                        if (els[i].className.indexOf('otto-selected') > -1) {
                            idx = i;
                        }
                    }
    
                    if (ev.keyCode == 40) {
                        // Down
                        if (idx !== null && idx < elsLen - 1) {
                            els[idx].className = els[idx].className.replace(' otto-selected', '');
                            els[idx + 1].className += ' otto-selected';
                            state.selected = els[idx + 1].choice;
                        } else if (idx === null) {
                            els[0].className += ' otto-selected';
                            state.selected = els[0].choice;
                        }
                    } else if (ev.keyCode == 38) {
                        // Up
                        if (idx !== null && idx > 0) {
                            els[idx].className = els[idx].className.replace(' otto-selected', '');
                            els[idx - 1].className += ' otto-selected';
                            state.selected = els[idx - 1].choice;
                        }
                    }
                }
            }
    
            root.addEventListener('keydown', function(ev) {
                if (ev.keyCode == 38 || ev.keyCode == 40) {
                    ev.preventDefault();
                    handleUpDown(ev);
                } else if (ev.keyCode == 13) {
                    // Prevents holding enter onkeydown
                    // Causing repeated requests
                    ev.preventDefault();
                }
            });
            
            root.addEventListener('keyup', function(ev) {
                if (ev.keyCode == 13) {
                    ev.preventDefault();
                    handleEnter(ev);
                }
            });
    
            root.addEventListener('input', function(ev) {
                handleInput(ev);
            });
    
            root.addEventListener('focus', function(ev) {
                state.setRedrawTimer();
                if (state.filteredChoices.length > 0) {
                    state.dropdown.style.display = '';
                }
            });
    
            root.addEventListener('blur', function(ev) {
                state.dropdown.style.display = 'none';
            });
    
            if (state.config.events) {
                Object.keys(state.config.events).forEach(function(key) {
                    root.addEventListener(key, state.config.events[key]);
                });
            }
    
            return root;
        }

        function Dropdown(root, customClass) {
            var dd = document.createElement('div');
            dd.className = 'otto-div' + ' ' + customClass;
            dd.style.width = (root.offsetWidth).toString() + 'px'; // compensate for border
            dd.style.top = (root.offsetHeight + root.offsetTop + 2).toString() + 'px';
            dd.style.left = (root.offsetLeft).toString() + 'px';
            dd.style.backgroundColor = 'white';
            dd.style.position = 'absolute';
            dd.style.overflow = 'hidden';
            dd.style.zIndex = '9999';
            dd.style.display = 'none';
            return dd;
        }

        function UnorderedList(customClass) {
            var ul = document.createElement('ul');
            ul.className = 'otto-ul' + ' ' + customClass;
            return ul;
        }

        function ListElement(choice, customClass) {
            var li = document.createElement('li');
            li.className = 'otto-li' + ' ' + customClass;
            li.style.listStyleType = 'none';
            li.choice = choice;
            li.style.cursor = 'default';
    
            if (state.config.renderItem) {
                li.innerHTML = state.config.renderItem(choice);
            } else {
                li.innerHTML = choice.emLabel;
            }
    
            li.addEventListener('mouseenter', function(ev) {
                state.clearSelected();
                ev.target.className += ' otto-selected';
                state.selected = ev.target.choice;
            });
    
            li.addEventListener('mouseleave', function(ev) {
                ev.target.className = ev.target.className.replace(' otto-selected', '');
                state.selected = null;
            });
    
            li.addEventListener('mousedown', function(ev) {
                state.inputValue = state.root.value = state.selected.value;
                state.filteredChoices = [];
    
                if (state.config.valueEvent) {
                    state.config.valueEvent(state.inputValue);
                }
    
                if (state.config.selectEvent) {
                    state.config.selectEvent(state.selected);
                }
            });
    
            return li;
        }

        function removeHTML(str) {
            return str.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
        }

        state.updateList();
        return { Otto: state };
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Otto;
    } else {
        var main = (this || (typeof window !== 'undefined' ? window : global));
        main.Otto = Otto;
    }
})();