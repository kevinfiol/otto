import { h } from 'hyperapp';

const dotSize = '6';

const Dot = opacity => h('div', {
    style: {
        borderRadius: '2em',
        margin: '0 0.1em',
        display: 'inline-block',
        height: dotSize + 'px',
        width: dotSize + 'px',
        background: 'black',
        opacity: opacity || '0.1',
        transition: 'all 0.3s ease'
    }
});

const Spinner = ({ key, inputRef }) => {
    return h('div', {
        key: key,
        style: {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: ((inputRef.offsetHeight / 2) - (dotSize / 2)) + 'px',
            right: '0.5em',
        },
        oncreate: div => {
            let current = 1;
            const children = div.childNodes;

            setInterval(() => {
                for (let i = 0; i < children.length; i++) {
                    // Reset Opacities
                    children[i].style.opacity = '0.1';
                }

                if (current === children.length)
                    current = 0;

                children[current].style.opacity = '0.4';
                current += 1;
            }, 300);
        }
    }, [Dot('0.4'), Dot(), Dot()]);
};

export default Spinner;