import Program from "/src/js/program";
import React from 'react';

export default class TestProgram extends Program {
    testCounter = 0;

    update() {
        this.testCounter += 1;
        this.refresh();
    }

    draw() {
        return (
            <div style={{ border: '2px solid red', width: '100%', height: '100%' }}>
                Test Program! {this.testCounter}
            </div>
        );
    }
}