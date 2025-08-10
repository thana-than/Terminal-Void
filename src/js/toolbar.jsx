import React from 'react';

export default function Toolbar({ program, excludeButtonFlags = {} }) {
    return <div className='toolbar'>
        {!excludeButtonFlags.close && <button onClick={() => program.close()}>X</button>}
    </div>
}