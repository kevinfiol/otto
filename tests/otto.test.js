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
        otto = new Otto(root, { minChars: 2, window }, choices);
    });

    o('Test applyFilter', () => {
        otto.inputValue = 'mi';
        otto.applyFilter();

        // Choices should be Michigan, Minnesota, Wyoming
        // Check Length
        const len = otto.filteredChoices.length;
        o(len).equals(3);

        const f = otto.filteredChoices[0];
        const s = otto.filteredChoices[1];
        const t = otto.filteredChoices[2];

        o(f.label).equals('Michigan');
        o(s.label).equals('Minnesota');
        o(t.label).equals('Wyoming');
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

    o('Test updateList', () => {
        // Must set inputvalue and applyfilter first to update filteredChoices
        otto.inputValue = 'mi';
        otto.applyFilter();

        // Update List
        otto.updateList();

        // Since there should be three choices
        // otto.ul should have three children `li` elements
        const len = otto.ul.children.length;
        o(len).equals(3);
    });

    o('Test handleEnter', () => {
        otto.inputValue = 'mi';
        otto.applyFilter();

        // Set this.selected to first filtered choice
        otto.selected = otto.filteredChoices[0];

        // Call handlEnter
        otto.handleEnter();

        o(otto.inputValue).equals(otto.selected.value);
        o(otto.filteredChoices.length).equals(0);
    });
});