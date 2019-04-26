import { h } from 'hyperapp';
import ListElement from './ListElement';

const UnorderedList = ({ ulClass, list, selected, emptyMsg }) => {
    return h('ul', { class: `otto-ul ${ulClass}`.trim() }, 
        list.length
            ? list.map((choice, index) => {
                const isSelected = (index === selected);
                return ListElement(choice, isSelected);
            })
            : h('li', { style: { padding: '0.3em' } }, emptyMsg)
        ,
    );
};

export default UnorderedList;