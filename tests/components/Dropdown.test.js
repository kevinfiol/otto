import o from 'ospec/ospec';
import Dropdown from '../../lib/components/Dropdown';

o.spec('Dropdown', () => {
    o('Renders', () => {
        // Mock Attributes
        let attrs = { dropdownClass: 'custom-dd', isSelectMode: true };
        let children = [1, 2, 3];

        let comp = Dropdown(attrs, children);
        o(comp.nodeName).equals('div');
        o(comp.attributes.class).equals('otto-div custom-dd');
        o(comp.children.length).equals(3);
    });
});