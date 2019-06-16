import { h } from 'hyperapp';

const ClearInputBtn = ({ inputRef, clearInput }) => {
    return h('div', {
        key: 'clearBtn',
        class: 'otto-clear',
        onclick: clearInput,
        oncreate: el => el.innerHTML = '&times;',
        style: {
            opacity: '0.7',
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: ((inputRef.offsetHeight / 2) - (22 / 2)) + 'px',
            right: '0.6em',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
            fontWeight: '400',
            fontSize: '20px',
            height: '22px'
        }
    });
};

export default ClearInputBtn;