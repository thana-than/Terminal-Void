import React from 'react';
import { createRoot } from 'react-dom/client';
import Terminal from './js/terminal.jsx';
import { Program } from './js/program.js';

Program.initialize();

const App = () => (
    <Terminal />
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);