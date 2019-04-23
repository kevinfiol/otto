'use strict';

function h(name, attributes) {
  var arguments$1 = arguments;

  var rest = [];
  var children = [];
  var length = arguments.length;

  while (length-- > 2) { rest.push(arguments$1[length]); }

  while (rest.length) {
    var node = rest.pop();
    if (node && node.pop) {
      for (length = node.length; length--; ) {
        rest.push(node[length]);
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node);
    }
  }

  return typeof name === "function"
    ? name(attributes || {}, children)
    : {
        nodeName: name,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      }
}

function app(state, actions, view, container) {
  var map = [].map;
  var rootElement = (container && container.children[0]) || null;
  var oldNode = rootElement && recycleElement(rootElement);
  var lifecycle = [];
  var skipRender;
  var isRecycling = true;
  var globalState = clone(state);
  var wiredActions = wireStateToActions([], globalState, clone(actions));

  scheduleRender();

  return wiredActions

  function recycleElement(element) {
    return {
      nodeName: element.nodeName.toLowerCase(),
      attributes: {},
      children: map.call(element.childNodes, function(element) {
        return element.nodeType === 3 // Node.TEXT_NODE
          ? element.nodeValue
          : recycleElement(element)
      })
    }
  }

  function resolveNode(node) {
    return typeof node === "function"
      ? resolveNode(node(globalState, wiredActions))
      : node != null
        ? node
        : ""
  }

  function render() {
    skipRender = !skipRender;

    var node = resolveNode(view);

    if (container && !skipRender) {
      rootElement = patch(container, rootElement, oldNode, (oldNode = node));
    }

    isRecycling = false;

    while (lifecycle.length) { lifecycle.pop()(); }
  }

  function scheduleRender() {
    if (!skipRender) {
      skipRender = true;
      setTimeout(render);
    }
  }

  function clone(target, source) {
    var out = {};

    for (var i in target) { out[i] = target[i]; }
    for (var i in source) { out[i] = source[i]; }

    return out
  }

  function setPartialState(path, value, source) {
    var target = {};
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value;
      return clone(source, target)
    }
    return value
  }

  function getPartialState(path, source) {
    var i = 0;
    while (i < path.length) {
      source = source[path[i++]];
    }
    return source
  }

  function wireStateToActions(path, state, actions) {
    for (var key in actions) {
      typeof actions[key] === "function"
        ? (function(key, action) {
            actions[key] = function(data) {
              var result = action(data);

              if (typeof result === "function") {
                result = result(getPartialState(path, globalState), actions);
              }

              if (
                result &&
                result !== (state = getPartialState(path, globalState)) &&
                !result.then // !isPromise
              ) {
                scheduleRender(
                  (globalState = setPartialState(
                    path,
                    clone(state, result),
                    globalState
                  ))
                );
              }

              return result
            };
          })(key, actions[key])
        : wireStateToActions(
            path.concat(key),
            (state[key] = clone(state[key])),
            (actions[key] = clone(actions[key]))
          );
    }

    return actions
  }

  function getKey(node) {
    return node ? node.key : null
  }

  function eventListener(event) {
    return event.currentTarget.events[event.type](event)
  }

  function updateAttribute(element, name, value, oldValue, isSvg) {
    if (name === "key") ; else if (name === "style") {
      if (typeof value === "string") {
        element.style.cssText = value;
      } else {
        if (typeof oldValue === "string") { oldValue = element.style.cssText = ""; }
        for (var i in clone(oldValue, value)) {
          var style = value == null || value[i] == null ? "" : value[i];
          if (i[0] === "-") {
            element.style.setProperty(i, style);
          } else {
            element.style[i] = style;
          }
        }
      }
    } else {
      if (name[0] === "o" && name[1] === "n") {
        name = name.slice(2);

        if (element.events) {
          if (!oldValue) { oldValue = element.events[name]; }
        } else {
          element.events = {};
        }

        element.events[name] = value;

        if (value) {
          if (!oldValue) {
            element.addEventListener(name, eventListener);
          }
        } else {
          element.removeEventListener(name, eventListener);
        }
      } else if (
        name in element &&
        name !== "list" &&
        name !== "type" &&
        name !== "draggable" &&
        name !== "spellcheck" &&
        name !== "translate" &&
        !isSvg
      ) {
        element[name] = value == null ? "" : value;
      } else if (value != null && value !== false) {
        element.setAttribute(name, value);
      }

      if (value == null || value === false) {
        element.removeAttribute(name);
      }
    }
  }

  function createElement(node, isSvg) {
    var element =
      typeof node === "string" || typeof node === "number"
        ? document.createTextNode(node)
        : (isSvg = isSvg || node.nodeName === "svg")
          ? document.createElementNS(
              "http://www.w3.org/2000/svg",
              node.nodeName
            )
          : document.createElement(node.nodeName);

    var attributes = node.attributes;
    if (attributes) {
      if (attributes.oncreate) {
        lifecycle.push(function() {
          attributes.oncreate(element);
        });
      }

      for (var i = 0; i < node.children.length; i++) {
        element.appendChild(
          createElement(
            (node.children[i] = resolveNode(node.children[i])),
            isSvg
          )
        );
      }

      for (var name in attributes) {
        updateAttribute(element, name, attributes[name], null, isSvg);
      }
    }

    return element
  }

  function updateElement(element, oldAttributes, attributes, isSvg) {
    for (var name in clone(oldAttributes, attributes)) {
      if (
        attributes[name] !==
        (name === "value" || name === "checked"
          ? element[name]
          : oldAttributes[name])
      ) {
        updateAttribute(
          element,
          name,
          attributes[name],
          oldAttributes[name],
          isSvg
        );
      }
    }

    var cb = isRecycling ? attributes.oncreate : attributes.onupdate;
    if (cb) {
      lifecycle.push(function() {
        cb(element, oldAttributes);
      });
    }
  }

  function removeChildren(element, node) {
    var attributes = node.attributes;
    if (attributes) {
      for (var i = 0; i < node.children.length; i++) {
        removeChildren(element.childNodes[i], node.children[i]);
      }

      if (attributes.ondestroy) {
        attributes.ondestroy(element);
      }
    }
    return element
  }

  function removeElement(parent, element, node) {
    function done() {
      parent.removeChild(removeChildren(element, node));
    }

    var cb = node.attributes && node.attributes.onremove;
    if (cb) {
      cb(element, done);
    } else {
      done();
    }
  }

  function patch(parent, element, oldNode, node, isSvg) {
    if (node === oldNode) ; else if (oldNode == null || oldNode.nodeName !== node.nodeName) {
      var newElement = createElement(node, isSvg);
      parent.insertBefore(newElement, element);

      if (oldNode != null) {
        removeElement(parent, element, oldNode);
      }

      element = newElement;
    } else if (oldNode.nodeName == null) {
      element.nodeValue = node;
    } else {
      updateElement(
        element,
        oldNode.attributes,
        node.attributes,
        (isSvg = isSvg || node.nodeName === "svg")
      );

      var oldKeyed = {};
      var newKeyed = {};
      var oldElements = [];
      var oldChildren = oldNode.children;
      var children = node.children;

      for (var i = 0; i < oldChildren.length; i++) {
        oldElements[i] = element.childNodes[i];

        var oldKey = getKey(oldChildren[i]);
        if (oldKey != null) {
          oldKeyed[oldKey] = [oldElements[i], oldChildren[i]];
        }
      }

      var i = 0;
      var k = 0;

      while (k < children.length) {
        var oldKey = getKey(oldChildren[i]);
        var newKey = getKey((children[k] = resolveNode(children[k])));

        if (newKeyed[oldKey]) {
          i++;
          continue
        }

        if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
          if (oldKey == null) {
            removeElement(element, oldElements[i], oldChildren[i]);
          }
          i++;
          continue
        }

        if (newKey == null || isRecycling) {
          if (oldKey == null) {
            patch(element, oldElements[i], oldChildren[i], children[k], isSvg);
            k++;
          }
          i++;
        } else {
          var keyedNode = oldKeyed[newKey] || [];

          if (oldKey === newKey) {
            patch(element, keyedNode[0], keyedNode[1], children[k], isSvg);
            i++;
          } else if (keyedNode[0]) {
            patch(
              element,
              element.insertBefore(keyedNode[0], oldElements[i]),
              keyedNode[1],
              children[k],
              isSvg
            );
          } else {
            patch(element, oldElements[i], null, children[k], isSvg);
          }

          newKeyed[newKey] = children[k];
          k++;
        }
      }

      while (i < oldChildren.length) {
        if (getKey(oldChildren[i]) == null) {
          removeElement(element, oldElements[i], oldChildren[i]);
        }
        i++;
      }

      for (var i in oldKeyed) {
        if (!newKeyed[i]) {
          removeElement(element, oldKeyed[i][0], oldKeyed[i][1]);
        }
      }
    }
    return element
  }
}

var Input = function () { return function (state, actions) {
    var oninput = function (e) {
        var val = e.target.value;
        actions.setInputVal(val);

        if (val && val.trim().length >= state.minChars) {
            if (state.source) {
                actions.fetchFromSource();
            } else {
                actions.applyFilter();
                actions.setShowDropdownOnFiltered();
                actions.setSelectedOnShowDropdown();
            }   
        } else {
            actions.setFiltered([]);
            actions.setShowDropdownOnFiltered();
            actions.setSelectedOnShowDropdown();
        }
    };

    var onfocus = function () {
        actions.setShowDropdownOnFiltered();
    };

    var onblur = function () {
        actions.setShowDropdown(false);
        actions.setSelected(null);
    };

    var onkeydown = function (e) {
        if (e.keyCode == 38 || e.keyCode == 40) {
            // Up or Down
            if (state.showDropdown) {
                e.preventDefault();

                if (e.keyCode == 38)
                    { actions.decrementSelected(); }
                if (e.keyCode == 40)
                    { actions.incrementSelected(); }
            }
        }

        if (e.keyCode == 9 || e.keyCode == 13) {
            // Enter or Tab
            if (state.showDropdown) {
                e.preventDefault();
                actions.setChoiceOnSelected();
                actions.applyFilter();
                actions.setSelected(null);
                actions.setShowDropdown(false);
            } else {
                // Custom Event for Enter
                if (e.keyCode == 13 && state.enterEvent)
                    { state.enterEvent(e); }
            }
        }
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

    return h('input', {
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: oninput,
        onfocus: onfocus,
        onblur: onblur,
        onkeydown: onkeydown,
        oncreate: oncreate
    });
}; };

var ListElement = function (choice, isSelected) { return function (state, actions) {
    var attrs = {
        key: choice.value,
        class: ("otto-li " + (state.liClass) + " " + (isSelected ? 'otto-selected' : '')).trim(),
        style: {
            listStyleType: 'none',
            cursor: 'default'
        },
        onmousedown: function () {
            actions.setChoiceAndInputVal(choice);
            actions.applyFilter();
            actions.focusInputAndHideDropdown();
        }
    };

    if (state.renderItem) {
        attrs.oncreate = function (e) { return e.innerHTML = state.renderItem(choice, state.inputVal); };
        return h('li', attrs);
    }

    // This check is to prevent rendering of choices in between XHR list gets
    if (choice.matchOn.toUpperCase().indexOf(state.inputVal.toUpperCase()) > -1) {
        var children;

        if (choice.label.toUpperCase().indexOf(state.inputVal.toUpperCase()) > -1) {
            children = createEmphasizedText(choice, state.inputVal);
        } else {
            // In case choice.matchOn is different from choice.label
            children = choice.label;
        }
        
        return h('li', attrs, children);
    }

    return null;
}; };

function createEmphasizedText(choice, inputVal) {
    var emLabel   = removeHTML(choice.label);
    var len     = inputVal.length;
    var emIndex = emLabel.toUpperCase().indexOf(inputVal.toUpperCase());

    var term = {
        beg: emLabel.slice(0, emIndex),
        mid: emLabel.slice(emIndex, emIndex + len),
        end: emLabel.slice(emIndex + len)
    };

    return [term.beg, h('b', {}, term.mid), term.end];
}

function removeHTML(s) {
    return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
}

var UnorderedList = function (list) { return function (state) {
    return h('ul', { class: ("otto-ul " + (state.ulClass)).trim() }, 
        list.length
            ? list.map(function (choice, index) {
                var isSelected = (index === state.selected);
                return ListElement(choice, isSelected);
            })
            : h('li', {}, 'nothing here')
        
    );
}; };

var Dropdown = function () { return function (state) {
    return h('div', {
        class: ("otto-div " + (state.dropdownClass)).trim(),
        style: {
            width: state.width,
            backgroundColor: 'white',
            position: 'absolute',
            overflow: 'hidden',
            zIndex: '99'
        }
    },
        UnorderedList(state.filtered)
    );
}; };

var App = function () { return function (state) {
    return h('div', { class: state.divClass }, [
        Input(),
        state.showDropdown ? Dropdown() : null
    ]);
}; };

var actions = {
    setAll: function (all) { return ({ all: all }); },

    setFiltered: function (filtered) { return ({ filtered: filtered }); },

    setShowDropdown: function (showDropdown) { return ({ showDropdown: showDropdown }); },

    setSelected: function (selected) { return ({ selected: selected }); },

    setInputRef: function (inputRef) { return ({ inputRef: inputRef }); },

    setInputVal: function (inputVal) { return function (state) {
        if (state.valueEvent)
            { state.valueEvent(inputVal); }
        return { inputVal: inputVal };
    }; },

    addToCache: function (key) { return function (state) {
        var newCache = Object.assign({}, state.cache);
        newCache[key] = [].concat( state.all );
        return { cache: newCache };
    }; },

    focusInputAndHideDropdown: function () { return function (state, actions) {
        setTimeout(function () {
            state.inputRef.focus();
            actions.setShowDropdown(false);
        });
    }; },

    setChoiceAndInputVal: function (choice) { return function (state, actions) {
        if (state.selectEvent)
            { state.selectEvent(choice); }
        
        actions.setInputVal(choice.value);
        return { choice: choice };
    }; },

    fetchFromSource: function () { return function (state, actions) {
        var key = state.inputVal.toUpperCase().trim();

        // Check Cache
        if (state.cache[key]) {
            actions.setAll(state.cache[key]);
            actions.applyFilter();

            actions.setShowDropdownOnFiltered();
            actions.setSelectedOnShowDropdown();
        } else {
            state.source(state.inputVal, function (res) {
                var choices = res || [];

                choices = choices.map(function (c) {
                    return Object.assign({}, c, {
                        label:   c.label,
                        matchOn: c.matchOn || c.label,
                        value:   c.value || c.label
                    });
                });

                actions.setAll(choices);
                actions.addToCache(key);

                actions.applyFilter();
                actions.setShowDropdownOnFiltered();
                actions.setSelectedOnShowDropdown();
            });
        }
    }; },

    applyFilter: function () { return function (state, actions) {
        var val = state.inputVal;

        var filtered = state.all.filter(function (c) {
            val = val.toUpperCase();
            var matchOn = c.matchOn;
            var index   = matchOn.toUpperCase().indexOf(val);

            var matchFullWord = state.matchFullWord || false
                ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
                : true
            ;

            return index > -1 && matchFullWord;
        });

        // Constrict to Max Result Count
        filtered = filtered.slice(0, state.maxResults);
        actions.setFiltered(filtered);
    }; },

    setShowDropdownOnFiltered: function () { return function (state, actions) {
        if (state.filtered.length)
            { actions.setShowDropdown(true); }
        else
            { actions.setShowDropdown(false); }
    }; },

    setSelectedOnShowDropdown: function () { return function (state, actions) {
        if (!state.showDropdown)
            { actions.setSelected(null); }
    }; },

    setChoiceOnSelected: function () { return function (state, actions) {
        if (state.selected !== null) {
            var choice = state.filtered[state.selected];
            actions.setChoiceAndInputVal(choice);
        }
    }; },

    incrementSelected: function () { return function (state, actions) {
        if (!state.showDropdown)
            { actions.setSelected(null); }
        else if (state.selected === null)
            { actions.setSelected(0); }
        else if (state.selected === state.filtered.length - 1)
            { return; }
        else
            { actions.setSelected(state.selected + 1); }
    }; },

    decrementSelected: function () { return function (state, actions) {
        if (!state.showDropdown)
            { actions.setSelected(null); }
        else if (state.selected === null || state.selected === 0)
            { actions.setSelected(0); }
        else
            { actions.setSelected(state.selected - 1); }
    }; }
};

function Otto(root, config, choices) {
    var this$1 = this;

    if (!this.isObject(config))
        { throw 'Otto Error: `config` must be an object.'; }
    if (choices !== undefined && !Array.isArray(choices))
        { throw 'Otto Error: `choices` must be an array of objects.'; }

    if (choices !== undefined) {
        // Check choices list
        choices.forEach(function (c) {
            if (!this$1.isObject(c) || !c.label) {
                throw 'Otto Error: All choices must be objects with a `label` attribute.';
            }
        });

        choices = choices.map(function (c) {
            return Object.assign({}, c, {
                label:   c.label,
                matchOn: c.matchOn || c.label,
                value:   c.value || c.label
            });
        });
    }

    // Create Otto Container
    var container  = document.createElement('div');
    var inputClass = root.className;
    var inputId    = root.id;

    var state = {
        width: (root.offsetWidth).toString() + 'px',
        showDropdown: true,
        selected: null,

        inputRef: null,
        inputId:    inputId || '',
        inputClass: inputClass || '',
        inputVal: '',
        choice: null,

        cache: {},
        filtered: [],
        all: choices || [],

        // User Configurations
        matchFullWord: config.matchFullWord || false,
        minChars: config.minChars || 3,
        maxResults: config.maxResults || 7,
        divClass: config.divClass || '',
        dropdownClass: config.dropdownClass || '',
        ulClass: config.ulClass || '',
        liClass: config.liClass || '',
        enterEvent: config.enterEvent || null,
        valueEvent: config.valueEvent || null,
        renderItem: config.renderItem || null,
        selectEvent: config.selectEvent || null,
        events: config.events || null,
        source: config.source || null
    };

    // Insert Container & Hide native input
    root.insertAdjacentElement('afterend', container);
    root.style.display = 'none';

    var view = function () { return App(); };
    this.application = app(state, actions, view, container);
}

Otto.prototype.isObject = function(x) {
    return (x !== null) && (x.constructor === Object);
};

module.exports = Otto;
//# sourceMappingURL=otto.cjs.js.map
