import { h } from 'hyperapp';

const SelectInput = () => (state, actions) => {
    const oninput = e => {
        const val = e.target.value;
        actions.setInputVal(val);
    };

    const onfocus = () => {
        actions.setShowDropdown(true);
    };

    const onblur = () => {
        actions.setShowDropdown(false);
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
};

export default SelectInput;