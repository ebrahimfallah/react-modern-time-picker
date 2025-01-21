import path from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
   {
      mode: 'production',
      entry: './src/index.ts',
      output: {
         path: path.resolve(__dirname, 'dist'),
         filename: 'index.cjs.js',
         library: {
            type: 'commonjs2',
         },
         globalObject: 'this',
      },
      resolve: {
         extensions: ['.tsx', '.ts', '.js'],
         alias: {
            '@': path.resolve(__dirname, 'src'),
         },
      },
      module: {
         rules: [
            {
               test: /\.(ts|tsx)$/,
               use: 'ts-loader',
               exclude: /node_modules/,
            },
            {
               test: /\.s[ac]ss$/i,
               use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
               test: /\.svg$/,
               use: ['@svgr/webpack'],
            },
         ],
      },
      plugins: [
         new MiniCssExtractPlugin({
            filename: 'styles.css',
         }),
      ],
      externals: {
         react: 'react',
         'react-dom': 'react-dom',
      },
   },
   // Configs for ES Module (ESM):
   {
      mode: 'production',
      entry: './src/index.ts',
      output: {
         path: path.resolve(__dirname, 'dist'),
         filename: 'index.esm.js',
         library: {
            type: 'module',
         },
      },
      experiments: {
         outputModule: true,
      },
      resolve: {
         extensions: ['.tsx', '.ts', '.js'],
         alias: {
            '@': path.resolve(__dirname, 'src'),
         },
      },
      module: {
         rules: [
            {
               test: /\.(ts|tsx)$/,
               use: 'ts-loader',
               exclude: /node_modules/,
            },
            {
               test: /\.s[ac]ss$/i,
               use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
               test: /\.svg$/,
               use: ['@svgr/webpack'],
            },
         ],
      },
      plugins: [
         new MiniCssExtractPlugin({
            filename: 'styles.css',
         }),
      ],
      externals: {
         react: 'react',
         'react-dom': 'react-dom',
      },
   },
];