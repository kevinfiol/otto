const actions = {
    setInputVal: inputVal => () => ({ inputVal }),

    setFiltered: filtered => () => ({ filtered }),

    setShowDropdown: showDropdown => () => ({ showDropdown }),

    applyFilter: val => state => {
        if (!val)
            return { filtered: [] };

        const filtered = state.all.filter(c => {
            val = val.toUpperCase();
            const matchOn = c.matchOn;
            const index   = matchOn.toUpperCase().indexOf(val);

            const matchFullWord = state.matchFullWord || false
                ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
                : true
            ;

            return index > -1 && matchFullWord;
        });

        return { filtered };
    },

    setShowDropdownOnFiltered: () => state => {
        if (state.filtered.length)
            return { showDropdown: true };
        return { showDropdown: false };
    }
};

export default actions;