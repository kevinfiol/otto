export const filterChoiceList = (val, list, matchFullWord, maxResults) => {
    const v = val.toUpperCase();

    let filtered = list.filter(c => {
        const label = c.label;
        const index = label.toUpperCase().indexOf(v);

        const wordPassesTest = matchFullWord || false
            ? label[index - 1] === undefined || label[index - 1] === ' '
            : true
        ;

        return index > -1 && wordPassesTest;
    });

    if (maxResults !== undefined)
        filtered = filtered.slice(0, maxResults);

    return filtered;
};

export const choicePropMap = choice => {
    return Object.assign({}, choice, {
        label: choice.label,
        value: choice.value || choice.label
    });
};

export const normalizeChoices = choices => {
    return choices.map(choicePropMap);
};

export const isObject = x => {
    return (x !== null) && (x.constructor === Object);
};