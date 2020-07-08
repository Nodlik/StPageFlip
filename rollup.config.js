import typeScript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { terser } from "rollup-plugin-terser";

export default [{
    input: 'src/PageFlip.ts',
    output: [{ file: 'dist/js/page-flip.browser.js', format: 'umd', name: 'St' }],
    plugins: [
        postcss(),
        typeScript({tsconfig: "tsconfig.json"}), terser()
    ]
}, {
    input: 'src/PageFlip.ts',
    output: [{ file: 'dist/js/page-flip.module.js', format: 'es' }],
    plugins: [
        postcss(),
        typeScript({tsconfig: "tsconfig.json"}), terser()
    ]
}];