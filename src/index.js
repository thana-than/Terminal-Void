import React from 'react';
import { createRoot } from 'react-dom/client';
import OS from './js/OS.jsx';
import init from './js/init.js'

const App = () => (
    <OS />
);

/* istanbul ignore next @preserve */
export const startReact = () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
}

init();
startReact();