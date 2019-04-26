import { h } from 'hyperapp';

const Dropdown = ({ dropdownClass }, children) => {
    return h('div', {
        class: `otto-div ${dropdownClass}`.trim(),
        style: {
            width: '100%',
            backgroundColor: 'white',
            overflow: 'hidden',
            zIndex: '99'
        }
    }, children);
};

export default Dropdown;