import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import 'overlayscrollbars/overlayscrollbars.css';
import '../css/scrollbar.css'

const Scrollbar = forwardRef(({ children, ...props }, ref) => {
    const scrollRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getViewport() {
            return scrollRef.current?.osInstance()?.elements().viewport || null;
        }
    }));

    props.className = `overlayScrollbar ${props.className || ''}`;
    return <OverlayScrollbarsComponent ref={scrollRef} defer data-overlayscrollbars-initialize
        options={{
            scrollbars: {
                theme: 'os-theme-light',
                clickScroll: true
            },
        }}
        {...props}
    >
        <div className='overlayScrollbarContents'>
            {children}
        </div>
    </OverlayScrollbarsComponent>
});

export default Scrollbar;