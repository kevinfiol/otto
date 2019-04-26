const filterChoiceList = (val, list, matchFullWord, maxResults) => {
    let filtered = list.filter(c => {
        const v = val.toUpperCase();
        const matchOn = c.matchOn;
        const index = matchOn.toUpperCase().indexOf(v);

        const wordPassesTest = matchFullWord || false
            ? matchOn[index - 1] === undefined || matchOn[index - 1] === ' '
            : true
        ;

        return index > -1 && wordPassesTest;
    });

    filtered = filtered.slice(0, maxResults);
    return filtered;
};

const choicePropMap = choice => {
    return Object.assign({}, choice, {
        label: choice.label,
        matchOn: choice.matchOn || choice.label,
        value: choice.value || choice.label
    });
};

export { filterChoiceList, choicePropMap };