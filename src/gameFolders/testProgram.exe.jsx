import { Program } from "/src/js/program";
import React from 'react';

export default class TestProgram extends Program {
    onKeyDown() { console.log("CLOSING PROG"); this.close(); }

    draw() {
        console.log("RUNNING PROG");
        return (
            <div style={{ border: '2px solid red', width: '100%', height: '100%' }}>Test Program!</div>
        );
    }
}