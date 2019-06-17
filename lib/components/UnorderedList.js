import { h } from 'hyperapp';

const UnorderedList = ({ ulClass }, children) => {
    return h('ul', { class: `otto-ul ${ulClass}`.trim() },
        children
    );
};

export default UnorderedList;