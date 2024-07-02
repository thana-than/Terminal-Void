import Program from "/src/js/program";
import React from 'react';

const Persistant = new Program();
Persistant.runs = 0;

Persistant.run = () => { Persistant.runs++; }

Persistant.draw = () => {
    return (
        <div style={{ border: '2px solid red', width: '100%', height: '100%' }}>You've run this program {Persistant.runs} times.</div>
    );
}

export default Persistant;