const actions = {
    setAll: all => ({ all }),

    setFiltered: filtered => ({ filtered }),

    setShowDropdown: showDropdown => ({ showDropdown }),

    setSelected: selected => ({ selected }),

    setInputRef: inputRef => ({ inputRef }),

    setInputVal: inputVal => state => {
        if (state.valueEvent)
            state.valueEvent(inputVal);
        return { inputVal };
    },

    addToCache: key => state => {
        const newCache = Object.assign({}, state.cache);
        newCache[key] = [...state.all];
        return { cache: newCache };
    },

    focusInputAndHideDropdown: () => (state, actions) => {
        setTimeout(() => {
            state.inputRef.focus();
            actions.setShowDropdown(false);
        });
    },

    setChoiceAndInputVal: choice => (state, actions) => {
        if (state.selectEvent)
            state.selectEvent(choice);
        
        actions.setInputVal(choice.value);
        return { choice };
    },

    fetchFromSource: () => (state, actions) => {
        const key = state.inputVal.toUpperCase().trim();

        // Check Cache
        if (state.cache[key]) {
            actions.setAll(state.cache[key]);
            actions.applyFilter();

            actions.setShowDropdownOnFiltered();
            actions.setSelectedOnShowDropdown();
        } else {
            state.source(state.inputVal, res => {
                let choices = res || [];

                choices = choices.map(c => {
                    return Object.assign({}, c, {
                        label:   c.label,
                        matchOn: c.matchOn || c.label,
                        value:   c.value || c.label
                    });
                });

                actions.setAll(choices);
                actions.addToCache(key);

                actions.applyFilter();
                actions.setShowDropdownOnFiltered();
                actions.setSelectedOnShowDropdown();
            });
        }
    },

    applyFilter: () => (state, actions) => {
        let val = state.inputVal;

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

    setChoiceOnSelected: () => (state, actions) => {
        if (state.selected !== null) {
            const choice = state.filtered[state.selected];
            actions.setChoiceAndInputVal(choice);
        }
    },

    incrementSelected: () => (state, actions) => {
        if (!state.showDropdown)
            actions.setSelected(null);
        else if (state.selected === null)
            actions.setSelected(0);
        else if (state.selected === state.filtered.length - 1)
            return;
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