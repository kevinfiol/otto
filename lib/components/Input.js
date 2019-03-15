import { h } from 'hyperapp';

const Input = () => (state, actions) => {
    const oninput = e => {
        actions.setInputVal(e.target.value);
        actions.applyFilter(e.target.value);
    };

    return h('input', {
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: oninput
    });
};

export default Input;