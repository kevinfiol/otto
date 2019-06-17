import { h } from 'hyperapp';

const Dropdown = ({ dropdownClass, isSelectMode }, children) => {
    return h('div', {
        class: `otto-div ${dropdownClass}`.trim(),
        style: {
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