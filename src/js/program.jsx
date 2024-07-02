import React from 'react';

export default class Program {
    refreshCallback = null;
    closeCallback = null;

    onKeyDown() { this.close(); }
    onKeyUp() { }

    refresh() {
        if (this.refreshCallback)
            this.refreshCallback(this.draw());
    }

    close() {
        if (this.closeCallback)
            this.closeCallback();
    }

    run() {

    }

    isRunning() {
        return this.closeCallback != null;
    }

    draw() {
        return (
            <div style={{ border: '2px solid red', width: '100%', height: '100%' }}>Program Block</div>
        );
    }
}