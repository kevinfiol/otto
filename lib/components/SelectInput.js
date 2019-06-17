import { h } from 'hyperapp';

const SelectInput = () => (state, actions) => {
    const onblur = () => {
        actions.setShowDropdown(false);
        actions.onSelectInputBlur();
    };

    const oncreate = dom => {
        actions.setFiltered(state.all);
        actions.setInputRef(dom);

        // Register Custom Event Listeners
        if (state.events) {
            Object.keys(state.events).forEach(key => {
                dom.addEventListener(key, state.events[key]);
            });
        }
    };

    return h('input', {
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
};

export default SelectInput;