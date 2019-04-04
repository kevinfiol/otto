import { h } from 'hyperapp';

const Input = () => (state, actions) => {
    const oninput = e => {
        const val = e.target.value;
        
        actions.setInputVal(val)
        actions.applyFilter();

        actions.setShowDropdownOnFiltered();
        actions.setSelectedOnShowDropdown();
    };

    // const onfocus = () => {
    //     actions.setShowDropdownOnFiltered();
    // };

    // const onblur = () => {
    //     actions.setShowDropdown(false);
    //     actions.setSelected(null);
    // };

    // const onkeydown = e => {
    //     if ([13, 38, 40].indexOf(e.keyCode) > -1) {
    //         e.preventDefault();

    //         if (e.keyCode == 38)
    //             actions.decrementSelected();
    //         if (e.keyCode == 40)
    //             actions.incrementSelected();
    //         actions.setInputValOnSelected();
    //     }
    // };

    return h('input', {
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: oninput,
        // onfocus: onfocus,
        // onblur: onblur,
        // onkeydown: onkeydown
    });
};

export default Input;