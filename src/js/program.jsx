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
            <>{this.value}</>
        );
    }
}

export { Program };