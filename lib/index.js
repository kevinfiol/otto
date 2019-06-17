import { app } from 'hyperapp';
import App from './components/App';
import actions from './actions';
import { isObject, normalizeChoices } from './util';

function Otto(root, config, choices) {
    if (!isObject(config))
        throw 'Otto Error: `config` must be an object.';
    if (choices !== undefined && !Array.isArray(choices))
        throw 'Otto Error: `choices` must be an array of objects.';

    if (choices !== undefined) {
        // Check choices list
        choices.forEach(c => {
            if (!isObject(c) || !c.label) {
                throw 'Otto Error: All choices must be objects with a `label` attribute.';
            }
        }); 

        choices = normalizeChoices(choices);
    }

    const state = {
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

    const view = () => App();
    this.actions = app(state, actions, view, root);
}

export default Otto;