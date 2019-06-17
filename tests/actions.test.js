import o from 'ospec/ospec';
import actions from '../lib/actions';

o.spec('Pure Actions', () => {
    o('setInputVal', () => {
        let state = { inputVal: '' };
        state = actions.setInputVal('new val')(state);
        o(state.inputVal).equals('new val');

        state = { inputVal: 'foo', valueEvent: v => o(v).equals('foobar') };
        state = actions.setInputVal('foobar')(state);
        o(state.inputVal).equals('foobar');
    });

    o('addToCache', () => {
        let state = { cache: { foo: ['one', 'two'] } };
        let args = { key: 'bar', choices: ['potato', 'sundae'] };
        state = actions.addToCache(args)(state);

        o(Object.keys(state.cache).length).equals(2);
        o(state.cache['foo'] !== undefined).equals(true);
        o(state.cache['bar'] !== undefined).equals(true);
        o(state.cache['bar'].length).equals(2);
    });
});