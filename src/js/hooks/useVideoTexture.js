import { useEffect, useState } from 'react';
import * as THREE from 'three';

export default function useVideoTexture(videoSrc) {
    const [videoTexture, setVideoTexture] = useState(null);

    useEffect(() => {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.play();

        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;

        setVideoTexture(texture);

        return () => {
            texture.dispose();
            video.pause();
            video.src = '';
        };
    }, [videoSrc]);

    return videoTexture;
}