import { filterChoiceList, choicePropMap } from './util';

const actions = {
    /**
     * Setters
     */
    setAll: all => ({ all }),

    setFiltered: filtered => ({ filtered }),

    setShowDropdown: showDropdown => ({ showDropdown }),

    setIsFetching: isFetching => ({ isFetching }),

    setSelected: selected => ({ selected }),

    setInputRef: inputRef => ({ inputRef }),

    setInputVal: inputVal => state => {
        if (state.valueEvent)
            state.valueEvent(inputVal);
        return { inputVal };
    },

    /**
     * Input Actions
     */
    onInput: e => (state, actions) => {
        const inputVal = e.target.value;
        actions.setInputVal(inputVal);

        const cb = choices => {
            const filtered = filterChoiceList(
                inputVal, 
                choices, 
                state.matchFullWord, 
                state.maxResults
            );

            actions.setAll(choices);
            actions.setFiltered(filtered);
            
            const showDropdown = filtered.length > 0;
            actions.setShowDropdown(showDropdown);
            if (!showDropdown) actions.setSelected(null);
        };

        if (inputVal && inputVal.trim().length >= state.minChars) {
            if (state.source) actions.fetchFromSource(cb);
            else cb(state.all);
        } else {
            actions.setFiltered([]);
            actions.setShowDropdown(false);
            actions.setSelected(null);
        }
    },

    onInputKeydown: e => (state, actions) => {
        if ((e.keyCode == 38 || e.keyCode == 40) && state.showDropdown) {
            // Up or Down
            e.preventDefault();
            if (e.keyCode == 38) actions.decrementSelected();
            if (e.keyCode == 40) actions.incrementSelected();
        }

        if (e.keyCode == 9 || e.keyCode == 13) {
            // Enter or Tab
            if (state.showDropdown) {
                e.preventDefault();

                let inputVal = undefined;
                if (state.selected !== null) {
                    const choice = state.filtered[state.selected];
                    if (state.selectEvent) state.selectEvent(choice);

                    inputVal = choice.value;
                    actions.setInputVal(inputVal);
                }

                const filtered = filterChoiceList(
                    inputVal || state.inputVal,
                    state.all,
                    state.matchFullWord,
                    state.maxResults
                );

                actions.setFiltered(filtered);
                actions.setSelected(null);
                actions.setShowDropdown(false);
            } else {
                if (e.keyCode == 13 && state.enterEvent)
                    state.enterEvent(e);
            }
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
    },

    /**
     * ListElement Actions
     */
    onListElementMouseDown: inputVal => (state, actions) => {        
        const filtered = filterChoiceList(
            inputVal,
            state.all,
            state.matchFullWord,
            state.maxResults
        );

        actions.setInputVal(inputVal);
        actions.setFiltered(filtered);
        actions.focusInputAndHideDropdown();
    },

    /**
     * Misc
     */
    addToCache: args => state => {
        const newCache = Object.assign({}, state.cache);
        newCache[args.key] = [...args.choices];
        return { cache: newCache };
    },

    /**
     * Asynchronous Actions
     */
    focusInputAndHideDropdown: () => (state, actions) => {
        setTimeout(() => {
            state.inputRef.focus();
            actions.setShowDropdown(false);
        });
    },

    fetchFromSource: cb => (state, actions) => {
        const key = state.inputVal.toUpperCase().trim();

        // Check Cache
        if (state.cache[key]) {
            cb(state.cache[key]);
        } else {
            actions.setIsFetching(true);

            state.source(state.inputVal, res => {
                let choices = res || [];
                choices = choices.map(choicePropMap);

                actions.addToCache({ key, choices });
                actions.setIsFetching(false);
                cb(choices);
            });
        }
    }
};

export default actions;