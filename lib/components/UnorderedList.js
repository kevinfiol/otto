import { h } from 'hyperapp';
import ListElement from './ListElement';

const UnorderedList = list => (state, actions) => {
    return h('ul', { class: 'otto-ul' }, 
        list.length
            ? list.map(c => ListElement(c))
            : h('li', {}, 'nothing here')
        ,
    );
};

export default UnorderedList;