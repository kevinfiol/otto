import { h } from 'hyperapp';

const Input = ({ key }) => (state, actions) => {
    const onfocus = () => {
        if (state.filtered.length)
            actions.setShowDropdown(true);
        else
            actions.setShowDropdown(false);
    };

    const onblur = () => {
        actions.setShowDropdown(false);
        actions.setSelected(null);
    };

    const oncreate = dom => {
        actions.setInputRef(dom);

        // Register Custom Event Listeners
        if (state.events) {
            Object.keys(state.events).forEach(key => {
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

export default Input;