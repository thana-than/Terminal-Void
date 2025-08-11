import React from 'react';
import Toolbar from './toolbar';

export default class Program extends React.Component {
    refreshCallback = null;
    closeCallback = null;
    themeStyle = "programTheme";
    canCloseOnKey = true;

    escapeKeys = new Set(['Escape', 'Backspace'])
    toolbarExcludeFlags = {};

    event_keyDown(event) {
        if (this.testCloseKey(event))
            return;

        this.onKeyDown(event)
    }
    event_keyUp(event) { this.onKeyUp(event) }

    event_resize() { }

    testCloseKey(event) {
        if (!this.canCloseOnKey)
            return false;

        const exitRequested = this.escapeKeys.has(event.key);//* Key tests

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
            <Toolbar program={this} excludeButtonFlags={this.toolbarExcludeFlags} />
            {this.draw()}
        </>;
    }

    draw() {
        return (
            <>Program Block</>
        );
    }
}