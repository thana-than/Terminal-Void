import React from 'react';

export default class Program {
    refreshCallback = null;
    closeCallback = null;
    themeStyle = "programTheme";
    canCloseOnKey = true

    event_keyDown(event) {
        if (this.testCloseKey(event))
            return;

        this.onKeyDown(event)
    }
    event_keyUp(event) { this.onKeyUp(event) }

    testCloseKey(event) {
        if (!this.canCloseOnKey)
            return false;

        const key = event.key.toLowerCase();
        const exitRequested = //* Some key tests
            key == "escape" ||
            key == "c" && event.ctrlKey;

        if (exitRequested)
            this.close();
        return exitRequested;
    }

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