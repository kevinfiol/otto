
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var Otto = (function () {
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

  var filterChoiceList = function (val, list, matchFullWord, maxResults) {
      var filtered = list.filter(function (c) {
          var v = val.toUpperCase();
          var matchOn = c.matchOn;
          var index = matchOn.toUpperCase().indexOf(v);

          var wordPassesTest = matchFullWord || false
              ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
              : true
          ;

          return index > -1 && wordPassesTest;
      });

      filtered = filtered.slice(0, maxResults);
      return filtered;
  };

  var choicePropMap = function (choice) {
      return Object.assign({}, choice, {
          label: choice.label,
          matchOn: choice.matchOn || choice.label,
          value: choice.value || choice.label
      });
  };

  var SelectInput = function () { return function (state, actions) {
      var oninput = function (e) {
          var val = e.target.value;
          actions.setInputVal(val);
      };

      var onfocus = function () {
          actions.setShowDropdown(true);
      };

      var onblur = function () {
          actions.setShowDropdown(false);
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
          id: state.inputId,
          class: state.inputClass,
          autocomplete: 'off',
          value: state.inputVal,
          oninput: oninput,
          onfocus: onfocus,
          oncreate: oncreate,
          onblur: onblur,
          style: { boxSizing: 'border-box' }
      });
  }; };

  var Input = function (ref) {
      var key = ref.key;

      return function (state, actions) {
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

      return h('input', {
          key: key,
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
  };
  };

  var Dropdown = function (ref, children) {
      var dropdownClass = ref.dropdownClass;
      var isSelectMode = ref.isSelectMode;

      return h('div', {
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

      return h('ul', { class: ("otto-ul " + ulClass).trim() },
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

      /**
       * If Custom Render Method
       */
      if (renderItem) {
          attrs.oncreate = function (e) { return e.innerHTML = renderItem(choice, inputVal); };
          return h('li', attrs);
      }

      var children;

      if (choice.label.toUpperCase().indexOf(inputVal.toUpperCase()) > -1) {
          children = createEmphasizedText(choice, inputVal);
      } else if (choice.label !== choice.matchOn) {
          children = createMatchedOnText(choice);
      } else {
          children = h('i', { style: { opacity: '0.4' } }, choice.label);
      }
      
      return h('li', attrs, children);
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

      return [term.beg, h('b', {}, term.mid), term.end];
  }

  function createMatchedOnText(choice) {
      return [
          choice.label,
          ' ',
          h('em', {
              style: { opacity: '0.6' }
          }, ("(" + (choice.matchOn) + ")"))
      ];
  }

  function removeHTML(s) {
      return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
  }

  var dotSize = '6';

  var Dot = function (opacity) { return h('div', {
      style: {
          borderRadius: '2em',
          margin: '0 0.1em',
          display: 'inline-block',
          height: dotSize + 'px',
          width: dotSize + 'px',
          background: 'black',
          opacity: opacity || '0.1',
          transition: 'all 0.3s ease'
      }
  }); };

  var Spinner = function (ref) {
      var key = ref.key;
      var inputRef = ref.inputRef;

      return h('div', {
          key: key,
          style: {
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              top: ((inputRef.offsetHeight / 2) - (dotSize / 2)) + 'px',
              right: '0.5em',
          },
          oncreate: function (div) {
              var current = 1;
              var children = div.childNodes;

              setInterval(function () {
                  for (var i = 0; i < children.length; i++) {
                      // Reset Opacities
                      children[i].style.opacity = '0.1';
                  }

                  if (current === children.length)
                      { current = 0; }

                  children[current].style.opacity = '0.4';
                  current += 1;
              }, 300);
          }
      }, [Dot('0.4'), Dot(), Dot()]);
  };

  var App = function () { return function (state, actions) {
      // Choices List
      var list = state.selectMode ? state.all : state.filtered;

      // List Element Action
      var onListElementMouseDown = actions.onListElementMouseDown;

      return h('div', { class: state.divClass },
          h('div', { style: { position: 'relative' } },
              (state.isFetching && state.inputRef !== null)
                  ? Spinner({ key: 'spinner', inputRef: state.inputRef })
                  : null
              ,

              state.selectMode
                  ? SelectInput({ key: 'input' })
                  : Input({ key: 'input' })
              
          ),

          state.showDropdown
              ? Dropdown({ dropdownClass: state.dropdownClass, isSelectMode: state.selectMode },
                  UnorderedList({ ulClass: state.ulClass },
                      list.map(function (c, i) {
                          return ListElement({
                              liClass: state.liClass,
                              choice: c,
                              isSelected: state.selected === i,
                              inputVal: state.inputVal,
                              renderItem: state.renderItem,
                              onmousedown: onListElementMouseDown
                          });
                      })
                  )
              )
              : null
          
      );
  }; };

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

      setInputVal: function (inputVal) { return function (state) {
          if (state.valueEvent)
              { state.valueEvent(inputVal); }
          return { inputVal: inputVal };
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
      addToCache: function (args) { return function (state) {
          var newCache = Object.assign({}, state.cache);
          newCache[args.key] = [].concat( args.choices );
          return { cache: newCache };
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

          choices = choices.map(choicePropMap);
      }

      var state = {
          showDropdown: false,
          isFetching: false,
          selected: null,
          inputRef: null,
          inputVal: '',
          choice: null,

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

          emptyMsg: config.emptyMsg || 'No Results.',
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
      this.application = app(state, actions, view, root);
  }

  Otto.prototype.isObject = function(x) {
      return (x !== null) && (x.constructor === Object);
  };

  return Otto;

}());
//# sourceMappingURL=otto.js.map
