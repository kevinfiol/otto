import { h } from 'hyperapp';
import UnorderedList from './UnorderedList';

const Dropdown = () => (state) => {
    return h('div', {
        class: 'otto-div',
        style: {
            width: state.width,
            backgroundColor: 'white',
            position: 'absolute',
            overflow: 'hidden',
            zIndex: '99'
        }
    },
        UnorderedList(state.filtered)
    );
};

export default Dropdown;