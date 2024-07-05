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
            <> Test Program! {this.testCounter} </>
        );
    }
}