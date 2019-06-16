import o from 'ospec/ospec';
import UnorderedList from '../../lib/components/UnorderedList';

o.spec('UnorderedList', () => {
    o('Renders', () => {
        let comp = UnorderedList({ ulClass: 'custom-ul ' }, [1, 2, 3]);
        o(comp.nodeName).equals('ul');
        o(comp.attributes.class).equals('otto-ul custom-ul');
        o(comp.children.length).equals(3);
        o(comp.children[2]).equals(3);
    });
});