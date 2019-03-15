const actions = {
    setInputVal: inputVal => () => ({ inputVal }),

    applyFilter: val => state => {
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
        console.log(filtered);
        return { filtered };
    }
};

export default actions;