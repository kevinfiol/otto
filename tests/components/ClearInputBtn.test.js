import o from 'ospec/ospec';
import ClearInputBtn from '../../lib/components/ClearInputBtn';

o.spec('ClearInputBtn', () => {
    o('Renders', () => {
        // Mock Attributes
        let attrs = { inputRef: { offsetHeight: 100 }, clearInput: () => 2 };

        let comp = ClearInputBtn(attrs);
        o(comp.nodeName).equals('div');
        o(comp.attributes.class).equals('otto-clear');
        o(comp.children.length).equals(0);
    });
});