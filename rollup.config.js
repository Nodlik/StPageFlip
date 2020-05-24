import typeScript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';

export default [{
    input: 'src/StPageFlip/PageFlip.ts',
    output: [{ file: 'dist/js/pageFlip.module.js', format: 'es' }],
    plugins: [
        postcss(),
        typeScript({tsconfig: "tsconfig.json"})
    ],
}];