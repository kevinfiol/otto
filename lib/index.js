import { app } from 'hyperapp';
import App from './components/App';
import actions from './actions';
import { choicePropMap } from './util';

function Otto(root, config, choices) {
    if (!this.isObject(config))
        throw 'Otto Error: `config` must be an object.';
    if (choices !== undefined && !Array.isArray(choices))
        throw 'Otto Error: `choices` must be an array of objects.';

    if (choices !== undefined) {
        // Check choices list
        choices.forEach(c => {
            if (!this.isObject(c) || !c.label) {
                throw 'Otto Error: All choices must be objects with a `label` attribute.';
            }
        });

        choices = this.normalizeChoices(choices);
    }

    const state = this.createState(config, choices);
    const view = () => App();

    this.actions = app(state, actions, view, root);
}

Otto.prototype.isObject = function(x) {
    return (x !== null) && (x.constructor === Object);
};

Otto.prototype.normalizeChoices = function(choices) {
    return choices.map(choicePropMap);
};

Otto.prototype.createState = function(config, choices) {
    return {
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
};

export default Otto;