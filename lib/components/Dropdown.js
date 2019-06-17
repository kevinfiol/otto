import { h } from 'hyperapp';

const Dropdown = ({ dropdownClass, isSelectMode }, children) => {
    return h('div', {
        class: `otto-dropdown ${dropdownClass}`.trim(),
        style: {
            position: 'absolute',
            maxHeight: isSelectMode ? '300px' : null,
            width: '100%',
            backgroundColor: 'white',
            overflow: 'hidden',
            overflowY: isSelectMode ? 'auto' : null,
            zIndex: '99'
        }
    }, children);
};

export default Dropdown;