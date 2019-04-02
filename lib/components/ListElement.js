import { h } from 'hyperapp';

const ListElement = choice => (state, actions) => {
    let emLabel   = removeHTML(choice.label);
    const len     = state.inputVal.length;
    const emIndex = emLabel.toUpperCase().indexOf(state.inputVal.toUpperCase());

    let beg, mid, end;

    if (emIndex > -1) {
        beg = emLabel.slice(0, emIndex);
        mid = emLabel.slice(emIndex, emIndex + len);
        end = emLabel.slice(emIndex + len);
    }

    return h('li', {
        key: choice.value,
        class: 'otto-li',
        style: {
            listStyleType: 'none',
            cursor: 'default'
        },
        onclick: () => {
            actions.setInputVal(choice.value);
            actions.applyFilter(choice.value);
            actions.setShowDropdown(false);
        }
    },
        beg, h('b', {}, mid), end
    );
};

function removeHTML(s) {
    return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
}

export default ListElement;