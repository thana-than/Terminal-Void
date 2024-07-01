import React from 'react';

class Program {
    refreshCallback = null;

    onKeyDown() { }
    onKeyUp() { }

    refresh() {
        if (this.refreshCallback)
            this.refreshCallback(this.draw());
    }

    draw() {
        return (
            <div style={{ border: '2px solid red', width: '100%', height: '100%' }}>Program Block</div>
        );
    }
}

export { Program };