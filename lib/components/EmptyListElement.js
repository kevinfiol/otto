import { h } from 'hyperapp';

const EmptyListElement = ({ emptyMsg }) => {
    return h('li', {
        style: {
            listStyleType: 'none',
            textAlign: 'center',
            padding: '0.5em',
            opacity: '0.5'
        }
    }, emptyMsg);
};

export default EmptyListElement;