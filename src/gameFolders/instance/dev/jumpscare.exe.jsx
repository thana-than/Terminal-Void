import '/src/css/os.css';
import React from "react";
import Program from "/src/js/program";
import floatingOverlay from '/src/js/FloatingOverlay';

class JumpScare extends Program {
    constructor() {
        super();
        this.queued = false;
        this.occurred = false;
        this.timer = 3000;
        this.duration = 300;
    }

    close() {
        if (!this.queued) {
            this.queued = true;
            setTimeout(() => {
                this.occurred = true;
                this.refresh();
                floatingOverlay(
                    <img src="assets/blindspot.png"></img>,
                    this.duration
                );
            }, this.timer);
        }
        super.close();
    }

    draw() {
        const message = this.occurred ? "ahh!!" : "boo!";
        return <div className='centered'><span>{message}</span></div>;
    }
}

export default new JumpScare();