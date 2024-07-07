import React from 'react';

export function Folder({ text = "Folder" }) {
    return <><Icon code='&#xe2c7;' /> {text}</>;
}

export function File({ text = "File" }) {
    return <><Icon code='&#xe873;' /> {text}</>;
}

export function Key({ text = "Key" }) {
    return <><Icon code='&#xe73c;' /> {text}</>;
}

export function Icon({ code }) {
    return (
        <span className="material-symbols-sharp">
            {code}
        </span>);
}