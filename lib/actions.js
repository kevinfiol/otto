const actions = {
    setInputVal: inputVal => () => ({ inputVal }),

    setFiltered: filtered => () => ({ filtered }),

    setShowDropdown: showDropdown => () => ({ showDropdown }),

    setSelected: selected => () => ({ selected }),

    applyFilter: () => state => {
        const val = state.inputVal;

        if (!val || val.trim().length < state.minChars)
            return { filtered: [] };

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

        return { filtered };
    },

    setShowDropdownOnFiltered: () => state => {
        if (state.filtered.length)
            return { showDropdown: true };
        return { showDropdown: false };
    },

    setSelectedOnShowDropdown: () => state => {
        if (!state.showDropdown)
            return { selected: null };
        return { selected: state.selected };
    },

    setInputValOnSelected: () => state => {
        if (state.selected !== null)
            return { inputVal: state.filtered[state.selected].value };
        return {};
    },

    incrementSelected: () => state => {
        if (!state.showDropdown)
            return { selected: null };
        
        if (state.selected === null)
            return { selected: 0 };

        if (state.selected === state.filtered.length - 1)
            return {};

        return { selected: state.selected + 1 };
    },

    decrementSelected: () => state => {
        if (!state.showDropdown)
            return { selected: null };
        if (state.selected === null || state.selected === 0)
            return { selected: 0 };
        return { selected: state.selected - 1 };
    }
};

export default actions;