import { Howl } from 'howler';
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

        this.sound = new Howl({
            src: ['assets/audio/jumpscare.wav']
        });
        this.sound.once('end', () => this.sound.unload());
    }

    examine() {
        if (this.occurred)
            return "jesus christ.";

        if (this.queued)
            return "Some jumpscare that was..."

        return "There's definitely a jumpscare in here...";
    }

    playJumpscare() {
        this.occurred = true;
        this.refresh();
        this.sound.play();
        floatingOverlay(
            <img src="assets/jumpscare.png"></img>,
            this.duration
        );
    }

    close() {
        if (!this.queued) {
            this.queued = true;
            setTimeout(() => {
                this.playJumpscare();
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