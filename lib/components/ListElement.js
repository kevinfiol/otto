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
            actions.setChoiceAndInputVal(choice);
            actions.applyFilter();
            actions.focusInputAndHideDropdown();
        }
    };

    if (state.renderItem) {
        attrs.oncreate = e => e.innerHTML = state.renderItem(choice, state.inputVal);
        return h('li', attrs);
    }

    // This check is to prevent rendering of choices in between XHR list gets
    if (choice.matchOn.toUpperCase().indexOf(state.inputVal.toUpperCase()) > -1) {
        let children;

        if (choice.label.toUpperCase().indexOf(state.inputVal.toUpperCase()) > -1) {
            children = createEmphasizedText(choice, state.inputVal);
        } else {
            // In case choice.matchOn is different from choice.label
            children = choice.label;
        }
        
        return h('li', attrs, children);
    }

    return null;
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