import React from 'react';

export default class Program {
    refreshCallback = null;
    closeCallback = null;
    themeStyle = "programTheme";
    canCloseOnKey = true

    uiFlags = {
        close: true,
        volume: true
    }

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
        const exitRequested = //* Key tests
            key == "escape"
        // || key == "c" && event.ctrlKey; //? was a good idea initially but would remove copy paste functionality from game

        if (exitRequested) {
            this.close();
            event.preventDefault();
        }

        return exitRequested;
    }

    onKeyDown(event) { this.close(); event.preventDefault(); }
    onKeyUp() { }

    refresh() {
        if (this.refreshCallback)
            this.refreshCallback(this.drawCall());
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

    drawCall() {
        return <>
            {this.draw_toolbar()}
            {this.draw()}
        </>;
    }

    draw_toolbar() {
        return <div className='toolbar'>
            {this.uiFlags.close && <button onClick={() => this.close()}>X</button>}
        </div>
    }

    draw() {
        return (
            <>Program Block</>
        );
    }
}