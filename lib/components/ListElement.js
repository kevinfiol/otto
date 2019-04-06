import { h } from 'hyperapp';

const ListElement = (choice, isSelected) => (state, actions) => {
    const attrs = {
        key: choice.value,
        class: `otto-li ${state.liClass} ${isSelected ? 'otto-selected' : ''}`.trim(),
        style: {
            listStyleType: 'none',
            cursor: 'default'
        },
        onmousedown: () => {
            actions.setInputVal(choice.value);
            actions.applyFilter();
            actions.setShowDropdown(false);
        }
    };

    if (state.renderItem) {
        attrs.oncreate = e => e.innerHTML = state.renderItem(choice, state.inputVal);
        return h('li', attrs);
    }

    const children = createEmphasizedText(choice, state.inputVal);
    return h('li', attrs, children);
};

function createEmphasizedText(choice, inputVal) {
    let emLabel   = removeHTML(choice.label);
    const len     = inputVal.length;
    const emIndex = emLabel.toUpperCase().indexOf(inputVal.toUpperCase());

    const term = {
        beg: emLabel.slice(0, emIndex),
        mid: emLabel.slice(emIndex, emIndex + len),
        end: emLabel.slice(emIndex + len)
    };

    return [term.beg, h('b', {}, term.mid), term.end];
}

function removeHTML(s) {
    return s.replace(/&/g, '').replace(/</g, '').replace(/>/g, '');
}

export default ListElement;