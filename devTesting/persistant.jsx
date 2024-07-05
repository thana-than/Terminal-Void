import Program from "/src/js/program";
import React from 'react';

const Persistant = new Program();
Persistant.runs = 0;

Persistant.run = () => { Persistant.runs++; }

Persistant.draw = () => {
    return (
        <>You've run this program {Persistant.runs} times.</>
    );
}

export default Persistant;