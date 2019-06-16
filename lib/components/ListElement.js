import { h } from 'hyperapp';

const ListElement = ({ liClass, choice, isSelected, inputVal, renderItem, onmousedown }) => {
    const attrs = {
        key: choice.value,
        class: `otto-li ${liClass} ${isSelected ? 'otto-selected' : ''}`.trim(),
        style: { listStyleType: 'none', cursor: 'default' },
        onmousedown: () => onmousedown(choice.value)
    };

    attrs.onupdate = li => {
        if (isSelected) li.scrollIntoView({ block: 'nearest' });
    };

    /**
     * If Custom Render Method
     */
    if (renderItem) {
        attrs.oncreate = e => e.innerHTML = renderItem(choice, inputVal);
        return h('li', attrs);
    }

    let children;

    if (choice.label.toUpperCase().indexOf(inputVal.toUpperCase()) > -1) {
        children = createEmphasizedText(choice, inputVal);
    } else {
        children = h('i', { style: { opacity: '0.5' } }, choice.label);
    }
    
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