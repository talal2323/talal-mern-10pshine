import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

// Polyfill TextEncoder and TextDecoder for JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;