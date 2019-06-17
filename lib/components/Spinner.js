import { h } from 'hyperapp';

const dotSize = '6';
const loOpacity = '0.3';
const hiOpacity = '0.7';

const Dot = opacity => h('div', {
    className: 'otto-spinner-dot',
    style: {
        borderRadius: '2em',
        margin: '0 0.1em',
        display: 'inline-block',
        height: dotSize + 'px',
        width: dotSize + 'px',
        opacity: opacity || loOpacity,
        transition: 'all 0.3s ease',
        backgroundColor: 'black'
    }
});

const Spinner = ({ inputRef, setTimer, clearTimer }) => {
    return h('div', {
        key: 'spinner',
        style: {
            class: 'otto-spinner',
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: ((inputRef.offsetHeight / 2) - (dotSize / 2)) + 'px',
            right: '2.6em',
        },
        ondestroy: () => {
            clearTimer();
        },
        oncreate: div => {
            let current = 1;
            const children = div.childNodes;

            setTimer(setInterval(() => {
                for (let i = 0; i < children.length; i++) {
                    // Reset Opacities
                    children[i].style.opacity = loOpacity;
                }

                if (current === children.length)
                    current = 0;

                children[current].style.opacity = hiOpacity;
                current += 1;
            }, 300));
        }
    }, [Dot(hiOpacity), Dot(), Dot()]);
};

export default Spinner;