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
const { window: { document } } = dom;

// Input Element
const root = document.querySelector('input');

o.spec('Testing Otto with Local Data', () => {
    let otto = null;

    const choices = [
        { label: 'Alabama' },
        { label: 'Alaska' },
        { label: 'Michigan' },
        { label: 'Minnesota' },
        { label: 'Wyoming' }
    ];

    o.before(() => {
        otto = new Otto(root, {}, choices);
    });

    o('Typing in `min`', () => {
        // console.log(root.children);
        o(1 + 1).equals(2);
    });
});