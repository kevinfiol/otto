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

    return h('input', {
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        onfocus: onfocus,
        onblur: onblur
    });
};

export default SelectInput;