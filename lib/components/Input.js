import { h } from 'hyperapp';

const Input = () => (state, actions) => {
    const oninput = e => {
        const val = e.target.value;
        actions.setInputVal(val);

        if (val && val.trim().length >= state.minChars) {
            if (state.source) {
                actions.fetchFromSource();
            } else {
                actions.applyFilter();
                actions.setShowDropdownOnFiltered();
                actions.setSelectedOnShowDropdown();
            }   
        } else {
            actions.setFiltered([]);
            actions.setShowDropdownOnFiltered();
            actions.setSelectedOnShowDropdown();
        }
    };

    const onfocus = () => {
        actions.setShowDropdownOnFiltered();
    };

    const onblur = () => {
        actions.setShowDropdown(false);
        actions.setSelected(null);
    };

    const onkeydown = e => {
        if (e.keyCode == 38 || e.keyCode == 40) {
            // Up or Down
            if (state.showDropdown) {
                e.preventDefault();

                if (e.keyCode == 38)
                    actions.decrementSelected();
                if (e.keyCode == 40)
                    actions.incrementSelected();
            }
        }

        if (e.keyCode == 9 || e.keyCode == 13) {
            // Enter or Tab
            if (state.showDropdown) {
                e.preventDefault();
                actions.setChoiceOnSelected();
                actions.applyFilter();
                actions.setSelected(null);
                actions.setShowDropdown(false);
            } else {
                // Custom Event for Enter
                if (e.keyCode == 13 && state.enterEvent)
                    state.enterEvent(e);
            }
        }
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
        class: state.inputClass,
        autocomplete: 'off',
        value: state.inputVal,
        oninput: oninput,
        onfocus: onfocus,
        onblur: onblur,
        onkeydown: onkeydown,
        oncreate: oncreate
    });
};

export default Input;