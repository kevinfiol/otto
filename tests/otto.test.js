const o     = require('ospec');
const jsdom = require('jsdom');
const Otto  = require('../lib/otto');

const { JSDOM } = jsdom;

const dom = new JSDOM(`
    <!DOCTYPE html>
        <input type="text" />
    </html>
`);

// Get Document Object
const { window } = dom;
const document   = window.document;

// Input Element
const root = document.querySelector('input');

o.spec('Otto Unit Tests', () => {
    let otto = null;

    const choices = [
        { label: 'Alabama' },
        { label: 'Alaska' },
        { label: 'Michigan' },
        { label: 'Minnesota' },
        { label: 'Wyoming' }
    ];

    o.before(() => {
        otto = new Otto(root, { window }, choices);
    });

    o('Test applyFilter', () => {
        otto.inputValue = 'min';
        otto.applyFilter();

        // Choices should be 'Minnesota' and 'Wyoming'
        // Check Length
        const len = otto.filteredChoices.length;
        o(len).equals(2);

        const f = otto.filteredChoices[0];
        const s = otto.filteredChoices[1];

        o(f.label).equals('Minnesota');
        o(s.label).equals('Wyoming');
    });

    o('Test handleInput', () => {
        const event = { target: { value: 'foo' } };
        otto.handleInput(event);

        o(otto.inputValue).equals('foo');
        o(otto.selected).equals(null);

        // 'foo' should not match, so filteredChoices should be empty
        const len = otto.filteredChoices.length;
        o(len).equals(0);
    });
});