import { h, app } from 'hyperapp';
import App from './components/App';
import actions from './actions';

function Otto(root, config, choices) {
    if (!this.isObject(config))
        throw 'Otto Error: `config` must be an object.';
    if (!Array.isArray(choices))
        throw 'Otto Error: `choices` must be an array of objects.';

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

    // Create Otto Container
    const container  = document.createElement('div');
    const inputClass = root.className;
    const inputId    = root.id;

    const state = {
        width: (root.offsetWidth).toString() + 'px',
        showDropdown: true,

        inputId:    inputId || '',
        inputClass: inputClass || '',

        inputVal: '',
        matchFullWord: config.matchFullWord || false,
        filtered: [],
        all:      choices
    };

    // Insert Container & Hide native input
    root.insertAdjacentElement('afterend', container);
    root.style.display = 'none';

    const view = (state, actions) => App();
    app(state, actions, view, container);
}

Otto.prototype.isObject = function(x) {
    return (x !== null) && (x.constructor === Object);
};

// Otto.prototype.removeHTML = function(s) {
//     return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
// };

export default Otto;