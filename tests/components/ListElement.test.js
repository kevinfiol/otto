import o from 'ospec/ospec';
import ListElement from '../../lib/components/ListElement';

o.spec('ListElement', () => {
    o('Renders', () => {
        // Mock Attributes
        let attrs = {
            liClass: 'custom-li',
            choice: { label: 'Alabama', value: 'Alabama' },
            isSelected: true,
            inputVal: 'alab',
            renderItem: null,
            onmousedown: v => v
        };

        let comp = ListElement(attrs);
        o(comp.attributes.class).equals('otto-li custom-li otto-selected');
        o(comp.children.length).equals(3);
        o(comp.attributes.key).equals('Alabama');
    });
});