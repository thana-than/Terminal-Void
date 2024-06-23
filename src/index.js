import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
    <div>
        <div id="output"></div>
        <input type="text" id="input" autofocus></input>
    </div>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);