import o from 'ospec/ospec';
import EmptyListElement from '../../lib/components/EmptyListElement';

o.spec('EmptyListElement', () => {
    o('Renders', () => {
        let comp = EmptyListElement({ emptyMsg: 'nothing here' });
        o(comp.nodeName).equals('li');
        o(comp.children.length).equals(1);
        o(comp.children[0]).equals('nothing here');
    });
});