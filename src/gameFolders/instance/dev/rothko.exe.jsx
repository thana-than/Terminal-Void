import React from 'react';
import { Sequence } from "/src/js/sequenceProgram";
import qr from '/src/assets/rothko_qr.txt'
import '/src/css/rothko.css'
import Gradient from "javascript-color-gradient";


const qr_string_array = qr.split(/\n/);
const qrLength = qr_string_array.length;

const gradientArray = new Gradient()
    .setColorGradient(
        "#F7C238", "#F7C238", "#F7C238", "#F7C238",
        "#EF8F5D",
        "#F37834", "#F37834", "#F37834", "#F37834", "#F37834")
    .setMidpoint(qrLength)
    .getColors();

const gradientLength = gradientArray.length;

const qr_array = qr_string_array.map((line, idx) => {
    const colorIdx = Math.floor(idx * (gradientLength - 1.0) / (qrLength - 1.0));
    console.log(colorIdx);
    return <div className='rothko' style={{ color: gradientArray[colorIdx] }} key={idx}>{line}</div>
});
const closeMessage = "Press any key to exit."


const OriginalRothko = () => {
    let rothko = new Sequence([...qr_array, <div className='rothko-end'>{closeMessage}</div>], false, "Original Rothko");
    rothko.themeStyle = "rothkoTheme";

    return rothko;
}

export default OriginalRothko;