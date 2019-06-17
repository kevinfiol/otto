import o from 'ospec/ospec';
import Spinner from '../../lib/components/Spinner';

o.spec('Spinner', () => {
    o('Renders', () => {
        // Mock State
        let state = { timer: null };

        // Mock Attributes
        let inputRef = { offsetHeight: 6 };

        // Mock Actions
        let setTimer = timer => state.timer = timer;
        let clearTimer = () => clearTimer(state.timer);

        let comp = Spinner({ inputRef, setTimer, clearTimer });
        o(comp.nodeName).equals('div');
        o(comp.children.length).equals(3);
    });
});