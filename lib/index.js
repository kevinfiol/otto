import { app } from 'hyperapp';
import App from './components/App';
import actions from './actions';

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

        choices = choices.map(c => {
            return Object.assign({}, c, {
                label:   c.label,
                matchOn: c.matchOn || c.label,
                value:   c.value || c.label
            });
        });
    }

    // Create Otto Container
    const container  = document.createElement('div');
    const inputClass = root.className;
    const inputId    = root.id;

    const state = {
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

    const view = () => App();
    this.application = app(state, actions, view, container);
}

Otto.prototype.isObject = function(x) {
    return (x !== null) && (x.constructor === Object);
};

export default Otto;