import { h } from 'hyperapp';
import ListElement from './ListElement';

const UnorderedList = list => (state, actions) => {
    return h('ul', { class: `otto-ul ${state.ulClass}`.trim() }, 
        list.length
            ? list.map((choice, index) => {
                const isSelected = (index === state.selected);
                return ListElement(choice, isSelected);
            })
            : h('li', {}, 'nothing here')
        ,
    );
};

export default UnorderedList;