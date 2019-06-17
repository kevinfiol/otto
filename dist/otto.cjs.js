'use strict';

var hyperapp = require('hyperapp');

var ClearInputBtn = function (ref) {
    var inputRef = ref.inputRef;
    var clearInput = ref.clearInput;

    return hyperapp.h('div', {
        key: 'clearBtn',
        class: 'otto-clear',
        onclick: clearInput,
        oncreate: function (el) { return el.innerHTML = '&times;'; },
        style: {
            opacity: '0.7',
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: ((inputRef.offsetHeight / 2) - (22 / 2)) + 'px',
            right: '0.6em',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
            fontWeight: '400',
            fontSize: '20px',
            height: '22px'
        }
    });
};

var EmptyListElement = function (ref) {
    var emptyMsg = ref.emptyMsg;

    return hyperapp.h('li', {
        style: {
            listStyleType: 'none',
            textAlign: 'center',
            padding: '0.5em',
            opacity: '0.5'
        }
    }, emptyMsg);
};

var SelectInput = function () { return function (state, actions) {
    var onblur = function () {
        actions.setShowDropdown(false);
        actions.onSelectInputBlur();
    };

    var oncreate = function (dom) {
        actions.setFiltered(state.all);
        actions.setInputRef(dom);

        // Register Custom Event Listeners
        if (state.events) {
            Object.keys(state.events).forEach(function (key) {
                dom.addEventListener(key, state.events[key]);
            });
        }
    };

    return hyperapp.h('input', {
        key: 'input',
        id: state.inputId,
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: actions.onSelectInput,
        onmousedown: actions.onSelectInputMousedown,
        onkeydown: actions.onInputKeydown,
        oncreate: oncreate,
        onblur: onblur,
        style: { boxSizing: 'border-box' }
    });
}; };

var Input = function () { return function (state, actions) {
    var onfocus = function () {
        if (state.filtered.length)
            { actions.setShowDropdown(true); }
        else
            { actions.setShowDropdown(false); }
    };

    var onblur = function () {
        actions.setShowDropdown(false);
        actions.setSelected(null);
    };

    var oncreate = function (dom) {
        actions.setInputRef(dom);

        // Register Custom Event Listeners
        if (state.events) {
            Object.keys(state.events).forEach(function (key) {
                dom.addEventListener(key, state.events[key]);
            });
        }
    };

    return hyperapp.h('input', {
        key: 'input',
        id: state.inputId,
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: actions.onInput,
        onkeydown: actions.onInputKeydown,
        onfocus: onfocus,
        onblur: onblur,
        oncreate: oncreate,
        style: { boxSizing: 'border-box' }
    });
}; };

var Dropdown = function (ref, children) {
    var dropdownClass = ref.dropdownClass;
    var isSelectMode = ref.isSelectMode;

    return hyperapp.h('div', {
        class: ("otto-div " + dropdownClass).trim(),
        style: {
            maxHeight: isSelectMode ? '300px' : null,
            width: '100%',
            backgroundColor: 'white',
            overflow: 'hidden',
            overflowY: isSelectMode ? 'auto' : null,
            zIndex: '99'
        }
    }, children);
};

var UnorderedList = function (ref, children) {
    var ulClass = ref.ulClass;

    return hyperapp.h('ul', { class: ("otto-ul " + ulClass).trim() },
        children
    );
};

var ListElement = function (ref) {
    var liClass = ref.liClass;
    var choice = ref.choice;
    var isSelected = ref.isSelected;
    var inputVal = ref.inputVal;
    var renderItem = ref.renderItem;
    var onmousedown = ref.onmousedown;

    var attrs = {
        key: choice.value,
        class: ("otto-li " + liClass + " " + (isSelected ? 'otto-selected' : '')).trim(),
        style: { listStyleType: 'none', cursor: 'default' },
        onmousedown: function () { return onmousedown(choice.value); }
    };

    attrs.onupdate = function (li) {
        if (isSelected) { li.scrollIntoView({ block: 'nearest' }); }
    };

    /**
     * If Custom Render Method
     */
    if (renderItem) {
        attrs.oncreate = function (e) { return e.innerHTML = renderItem(choice, inputVal); };
        return hyperapp.h('li', attrs);
    }

    var children;

    if (choice.label.toUpperCase().indexOf(inputVal.toUpperCase()) > -1) {
        children = createEmphasizedText(choice, inputVal);
    } else {
        children = hyperapp.h('i', { style: { opacity: '0.5' } }, choice.label);
    }
    
    return hyperapp.h('li', attrs, children);
};

function createEmphasizedText(choice, inputVal) {
    var emLabel   = removeHTML(choice.label);
    var len     = inputVal.length;
    var emIndex = emLabel.toUpperCase().indexOf(inputVal.toUpperCase());

    var term = {
        beg: emLabel.slice(0, emIndex),
        mid: emLabel.slice(emIndex, emIndex + len),
        end: emLabel.slice(emIndex + len)
    };

    return [term.beg, hyperapp.h('b', {}, term.mid), term.end];
}

function removeHTML(s) {
    return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
}

var dotSize = '6';
var loOpacity = '0.3';
var hiOpacity = '0.7';

var Dot = function (opacity) { return hyperapp.h('div', {
    className: 'otto-spinner',
    style: {
        borderRadius: '2em',
        margin: '0 0.1em',
        display: 'inline-block',
        height: dotSize + 'px',
        width: dotSize + 'px',
        opacity: opacity || loOpacity,
        transition: 'all 0.3s ease'
    }
}); };

var Spinner = function (ref) {
    var inputRef = ref.inputRef;
    var setTimer = ref.setTimer;
    var clearTimer = ref.clearTimer;

    return hyperapp.h('div', {
        key: 'spinner',
        style: {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: ((inputRef.offsetHeight / 2) - (dotSize / 2)) + 'px',
            right: '2.6em',
        },
        ondestroy: function () {
            clearTimer();
        },
        oncreate: function (div) {
            var current = 1;
            var children = div.childNodes;

            setTimer(setInterval(function () {
                for (var i = 0; i < children.length; i++) {
                    // Reset Opacities
                    children[i].style.opacity = loOpacity;
                }

                if (current === children.length)
                    { current = 0; }

                children[current].style.opacity = hiOpacity;
                current += 1;
            }, 300));
        }
    }, [Dot(hiOpacity), Dot(), Dot()]);
};

var App = function () { return function (state, actions) {
    // State
    var list = state.filtered;

    // Computed
    var showClearBtn = (state.showClearBtn && state.inputVal && state.inputRef !== null);
    var showSpinner  = (state.showSpinner && state.isFetching && state.inputRef !== null);
    var showEmptyMsg = (state.selectMode && list.length < 1);

    var clearInput = function () {
        actions.setInputVal('');
        actions.focusInputAndHideDropdown();
    };

    return hyperapp.h('div', { class: state.divClass },
        hyperapp.h('div', { style: { position: 'relative' } },
            state.selectMode
                ? SelectInput()
                : Input()
            ,

            showClearBtn &&
                ClearInputBtn({ inputRef: state.inputRef, clearInput: clearInput })
            ,

            showSpinner &&
                Spinner({
                    inputRef: state.inputRef,
                    setTimer: actions.setTimer,
                    clearTimer: actions.clearTimer
                })
            
        ),

        state.showDropdown &&
            Dropdown({ dropdownClass: state.dropdownClass, isSelectMode: state.selectMode },
                UnorderedList({ ulClass: state.ulClass },
                    showEmptyMsg
                        ? EmptyListElement({ emptyMsg: state.emptyMsg })
                        : list.map(function (c, i) {
                            return ListElement({
                                liClass: state.liClass,
                                choice: c,
                                isSelected: state.selected === i,
                                inputVal: state.inputVal,
                                renderItem: state.renderItem,
                                onmousedown: actions.onListElementMouseDown
                            });
                        })
                    
                )
            )
        
    );
}; };

var filterChoiceList = function (val, list, matchFullWord, maxResults) {
    var v = val.toUpperCase();

    var filtered = list.filter(function (c) {
        var label = c.label;
        var index = label.toUpperCase().indexOf(v);

        var wordPassesTest = matchFullWord || false
            ? label[index - 1] === undefined || label[index - 1] === ' '
            : true
        ;

        return index > -1 && wordPassesTest;
    });

    if (maxResults !== undefined)
        { filtered = filtered.slice(0, maxResults); }

    return filtered;
};

var choicePropMap = function (choice) {
    return Object.assign({}, choice, {
        label: choice.label,
        value: choice.value || choice.label
    });
};

var normalizeChoices = function (choices) {
    return choices.map(choicePropMap);
};

var isObject = function (x) {
    return (x !== null) && (x.constructor === Object);
};

var actions = {
    /**
     * Setters
     */
    setAll: function (all) { return ({ all: all }); },

    setFiltered: function (filtered) { return ({ filtered: filtered }); },

    setShowDropdown: function (showDropdown) { return ({ showDropdown: showDropdown }); },

    setIsFetching: function (isFetching) { return ({ isFetching: isFetching }); },

    setSelected: function (selected) { return ({ selected: selected }); },

    setInputRef: function (inputRef) { return ({ inputRef: inputRef }); },

    setTimer: function (timer) { return ({ timer: timer }); },

    setInputVal: function (inputVal) { return function (state) {
        if (state.valueEvent)
            { state.valueEvent(inputVal); }
        return { inputVal: inputVal };
    }; },

    addToCache: function (args) { return function (state) {
        var newCache = Object.assign({}, state.cache);
        newCache[args.key] = [].concat( args.choices );
        return { cache: newCache };
    }; },

    /**
     * Input Actions
     */
    onInput: function (e) { return function (state, actions) {
        var inputVal = e.target.value;
        actions.setInputVal(inputVal);

        var cb = function (choices) {
            var filtered = filterChoiceList(
                inputVal, 
                choices, 
                state.matchFullWord, 
                state.maxResults
            );

            actions.setAll(choices);
            actions.setFiltered(filtered);
            
            var showDropdown = filtered.length > 0;
            actions.setShowDropdown(showDropdown);
            if (!showDropdown) { actions.setSelected(null); }
        };

        if (inputVal && inputVal.trim().length >= state.minChars) {
            if (state.source) { actions.fetchFromSource(cb); }
            else { cb(state.all); }
        } else {
            actions.setFiltered([]);
            actions.setShowDropdown(false);
            actions.setSelected(null);
        }
    }; },

    onInputKeydown: function (e) { return function (state, actions) {
        if ((e.keyCode == 38 || e.keyCode == 40) && state.showDropdown) {
            // Up or Down
            e.preventDefault();
            if (e.keyCode == 38) { actions.decrementSelected(); }
            if (e.keyCode == 40) { actions.incrementSelected(); }
        }

        if (e.keyCode == 9 || e.keyCode == 13) {
            // Enter or Tab
            if (state.showDropdown) {
                e.preventDefault();

                var inputVal = undefined;
                if (state.selected !== null) {
                    var choice = state.filtered[state.selected];
                    if (state.selectEvent) { state.selectEvent(choice); }

                    inputVal = choice.value;
                    actions.setInputVal(inputVal);
                }

                var filtered = filterChoiceList(
                    inputVal || state.inputVal,
                    state.all,
                    state.matchFullWord,
                    state.maxResults
                );

                actions.setFiltered(filtered);
                actions.setSelected(null);
                actions.setShowDropdown(false);
            } else {
                if (e.keyCode == 13 && state.enterEvent)
                    { state.enterEvent(e); }
            }
        }
    }; },

    incrementSelected: function () { return function (state, actions) {
        if (!state.showDropdown)
            { actions.setSelected(null); }
        else if (state.selected === null)
            { actions.setSelected(0); }
        else if (state.selected !== state.filtered.length - 1)
            { actions.setSelected(state.selected + 1); }
    }; },

    decrementSelected: function () { return function (state, actions) {
        if (!state.showDropdown)
            { actions.setSelected(null); }
        else if (state.selected === null || state.selected === 0)
            { actions.setSelected(0); }
        else
            { actions.setSelected(state.selected - 1); }
    }; },

    /**
     * SelectInput Actions
     */
    onSelectInput: function (e) { return function (state, actions) {
        var inputVal = e.target.value;
        actions.setInputVal(inputVal);

        if (state.source) {
            actions.fetchFromSource(function (choices) {
                var filtered = filterChoiceList(inputVal, choices, state.matchFullWord);
                actions.setAll(choices);
                actions.setFiltered(filtered);
            });
        } else {
            if (inputVal.trim() === '') {
                actions.setFiltered(state.all);
            } else {
                var filtered = filterChoiceList(inputVal, state.all, state.matchFullWord);
                actions.setFiltered(filtered);
            }
        }
    }; },

    onSelectInputMousedown: function () { return function (state, actions) {
        if (state.source) {
            actions.fetchFromSource(function (choices) {
                actions.setAll(choices);
                actions.setFiltered(choices);
                actions.setShowDropdown(true);
            });
        } else {
            actions.setShowDropdown(true);
        }
    }; },

    onSelectInputBlur: function () { return function (state, actions) {
        var inputVal = state.inputVal;

        // Check if inputVal exists in list
        var value = null;

        for (var i = 0; i < state.all.length; i++) {
            if (state.all[i].value.toUpperCase() === inputVal.trim().toUpperCase()) {
                value = state.all[i].value;
                break;
            }
        }

        if (!value) { actions.setInputVal(''); }
        else { actions.setInputVal(value); }

        actions.setFiltered(state.all);
    }; },

    /**
     * ListElement Actions
     */
    onListElementMouseDown: function (inputVal) { return function (state, actions) {
        var filtered = filterChoiceList(
            inputVal,
            state.all,
            state.matchFullWord,
            state.maxResults
        );

        actions.setInputVal(inputVal);
        actions.setFiltered(filtered);
        actions.focusInputAndHideDropdown();
    }; },

    /**
     * Misc
     */

    clearTimer: function () { return function (state) {
        clearInterval(state.timer);
    }; },

    /**
     * Asynchronous Actions
     */
    focusInputAndHideDropdown: function () { return function (state, actions) {
        setTimeout(function () {
            state.inputRef.focus();
            actions.setShowDropdown(false);
        });
    }; },

    fetchFromSource: function (cb) { return function (state, actions) {
        var key = state.inputVal.toUpperCase().trim();

        // Check Cache
        if (state.cache[key]) {
            cb(state.cache[key]);
        } else {
            actions.setIsFetching(true);

            state.source(state.inputVal, function (res) {
                var choices = res || [];
                choices = choices.map(choicePropMap);

                actions.addToCache({ key: key, choices: choices });
                actions.setIsFetching(false);
                cb(choices);
            });
        }
    }; }
};

function Otto(root, config, choices) {
    if (!isObject(config))
        { throw 'Otto Error: `config` must be an object.'; }
    if (choices !== undefined && !Array.isArray(choices))
        { throw 'Otto Error: `choices` must be an array of objects.'; }

    if (choices !== undefined) {
        // Check choices list
        choices.forEach(function (c) {
            if (!isObject(c) || !c.label) {
                throw 'Otto Error: All choices must be objects with a `label` attribute.';
            }
        }); 

        choices = normalizeChoices(choices);
    }

    var state = {
        showDropdown: false,
        isFetching: false,
        selected: null,
        inputRef: null,
        inputVal: '',
        timer: undefined,

        cache: {},
        filtered: [],
        all: choices || [],

        // User Configurations
        // Classes & Ids
        inputId: config.inputId || null,
        inputClass: config.inputClass || null,
        divClass: config.divClass || null,
        dropdownClass: config.dropdownClass || '',
        ulClass: config.ulClass || '',
        liClass: config.liClass || '',

        showClearBtn: config.showClearBtn || true,
        showSpinner: config.showSpinner || true,
        emptyMsg: config.emptyMsg || 'No Options',
        selectMode: config.selectMode || false,
        matchFullWord: config.matchFullWord || false,
        minChars: config.minChars || 3,
        maxResults: config.maxResults || 7,
        enterEvent: config.enterEvent || null,
        valueEvent: config.valueEvent || null,
        renderItem: config.renderItem || null,
        selectEvent: config.selectEvent || null,
        events: config.events || null,
        source: config.source || null
    };

    var view = function () { return App(); };
    this.actions = hyperapp.app(state, actions, view, root);
}

module.exports = Otto;
//# sourceMappingURL=otto.cjs.js.map
