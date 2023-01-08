import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

export default [{
  input: './index.ts',
  output: [
    {
      file: './dist/umd.js',
      format: 'umd',
      name: 'myUmdLib'
    },
    {
      file: './dist/es.js',
      format: 'es',
    },
    {
      file: './dist/cjs.js',
      format: 'cjs',
    }
  ],
  plugins: [typescript({
    tsconfig: '../../tsconfig.json'
  })]
}, {
  input: './index.ts',
  output: [
    {
      file: './dist/index.d.ts',
      format: 'e',
    },
  ],
  plugins: [dts()]
}]