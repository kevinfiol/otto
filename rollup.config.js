import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const isProd = process.env.PROD === 'true';

const input = './lib/index.js';

const filenames = {
    iife: isProd ? './dist/otto.min.js' : './dev/otto.js',
    cjs:  isProd ? './dist/otto.cjs.js' : './dev/otto.cjs.js'
};

const configs = [
    {
        input,
        output: {
            name: 'Otto',
            file: filenames.iife,
            format: 'iife',
            sourcemap: !isProd
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            buble(),
            isProd && uglify.uglify()
        ]
    },
    {
        input,
        output: {
            name: 'Otto',
            file: filenames.cjs,
            format: 'cjs',
            sourcemap: !isProd
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            buble()
        ]
    }
];

export default configs;