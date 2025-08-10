import React from 'react';

export default function Toolbar({ program, excludeButtonFlags = {} }) {

    const toggleFullscreen = () => {
        var elem = document.body;
        if (document.fullscreenElement == elem)
            document.exitFullscreen();
        else
            elem.requestFullscreen();
    }

    return <div className='toolbar' tabIndex="0">
        {!excludeButtonFlags.close && <ToolbarButton onClick={() => program.close()}>X</ToolbarButton>}
        {!excludeButtonFlags.fullscreen && <ToolbarButton onClick={() => toggleFullscreen()}>◳</ToolbarButton>}
    </div>
}

function ToolbarButton({ onClick, children }) {
    return <button className='toolbarButton' onClick={onClick}>
        <div className='toolbarButtonBackground'></div>
        <div className='toolbarButtonContents'>{children}</div>
    </button>;
}