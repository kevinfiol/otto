import { h } from 'hyperapp';

const Input = () => (state, actions) => {
    const oninput = e => {
        const val = e.target.value;
        actions.setInputVal(val)

        if (val.trim().length >= state.minChars) {
            actions.applyFilter(val);
        } else {
            actions.setFiltered([]);
        }

        actions.setShowDropdownOnFiltered();
    };

    return h('input', {
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: oninput
    });
};

export default Input;