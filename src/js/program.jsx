import React from 'react';

export default class Program {
    refreshCallback = null;
    closeCallback = null;
    themeStyle = "programTheme";

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
            <>Program Block</>
        );
    }
}