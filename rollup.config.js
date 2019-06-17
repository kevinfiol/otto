import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isProd = process.env.PROD === 'true';
const isDev = process.env.DEV === 'true';

const input = './lib/index.js';

const filenames = {
    iife: isProd ? './dist/otto.min.js' : './dist/otto.js',
    cjs:  isProd ? './dist/otto.cjs.js' : './dist/otto.cjs.js'
};

const configs = [
    {
        input,
        output: {
            name: 'Otto',
            file: filenames.iife,
            format: 'iife',
            sourcemap: isDev
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            buble(),
            isProd && uglify.uglify(),
            isDev && serve('dist'),
            isDev && livereload('dist')
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
        ],
        external: ['hyperapp']
    }
];

export default configs;