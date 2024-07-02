import React from 'react';
import { createRoot } from 'react-dom/client';
import OS from './js/OS.jsx';
import { Global } from './js/global.js';

Global.initialize();

const App = () => (
    <OS />
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);