const actions = {
    setFiltered: filtered => ({ filtered }),

    setShowDropdown: showDropdown => ({ showDropdown }),

    setSelected: selected => ({ selected }),

    setInputVal: inputVal => state => {
        if (state.valueEvent)
            state.valueEvent(inputVal);
        return { inputVal };
    },

    applyFilter: () => (state, actions) => {
        let val = state.inputVal;

        if (!val || val.trim().length < state.minChars) {
            actions.setFiltered([]);
            return;
        }

        let filtered = state.all.filter(c => {
            val = val.toUpperCase();
            const matchOn = c.matchOn;
            const index   = matchOn.toUpperCase().indexOf(val);

            const matchFullWord = state.matchFullWord || false
                ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
                : true
            ;

            return index > -1 && matchFullWord;
        });

        // Constrict to Max Result Count
        filtered = filtered.slice(0, state.maxResults);
        actions.setFiltered(filtered);
    },

    setShowDropdownOnFiltered: () => (state, actions) => {
        if (state.filtered.length)
            actions.setShowDropdown(true);
        else
            actions.setShowDropdown(false);
    },

    setSelectedOnShowDropdown: () => (state, actions) => {
        if (!state.showDropdown)
            actions.setSelected(null);
    },

    setInputValOnSelected: () => (state, actions) => {
        if (state.selected !== null) {
            const inputVal = state.filtered[state.selected].value;
            actions.setInputVal(inputVal);
        }
    },

    incrementSelected: () => (state, actions) => {
        if (!state.showDropdown)
            actions.setSelected(null);
        else if (state.selected === null)
            actions.setSelected(0);
        else if (state.selected === state.filtered.length - 1)
            return
        else
            actions.setSelected(state.selected + 1);
    },

    decrementSelected: () => (state, actions) => {
        if (!state.showDropdown)
            actions.setSelected(null);
        else if (state.selected === null || state.selected === 0)
            actions.setSelected(0);
        else
            actions.setSelected(state.selected - 1);
    }
};

export default actions;