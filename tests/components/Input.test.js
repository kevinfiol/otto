import o from 'ospec/ospec';
import Input from '../../lib/components/Input';

o.spec('Input', () => {
    o('Renders', () => {
        // Mock State
        let state = {
            all: [1, 2, 3],
            filtered: null,
            inputRef: null,
            inputId: 'input-id',
            inputClass: 'input-class',
            inputVal: 'nothing for now'
        };

        // Mock Actions
        let actions = {
            setFiltered: filtered => state.filtered = filtered,
            setInputRef: inputRef => state.inputRef = inputRef,
            onSelectInput: () => 'onSelectInput',
            onSelectInputMousedown: () => 'onSelectInputMousedown',
            onInputKeydown: () => 'onInputKeydown'
        };

        let comp = Input()(state, actions);
        o(comp.nodeName).equals('input');
        o(comp.attributes.id).equals('input-id');
        o(comp.attributes.class).equals('input-class');
        o(comp.attributes.value).equals('nothing for now');
    });
});