import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import Application from "/src/js/applicationProgram.jsx";
import fragmentShader from "/src/shaders/adaflower_fragment.glsl";
import vertexShader from "/src/shaders/vertex.glsl";
import dancingFigureVideo from '/src/assets/pexels_ron_lach_dancing_figure.mp4';
import flowerTexture from '/src/assets/pexels-saifullah-hafeel-flowers.jpg'
import textTexture from '/src/assets/god_turn_me_into_a_flower.png'
import useVideoTexture from '/src/js/hooks/useVideoTexture.js';


const Art = () => {
    const mesh = useRef();
    const material = useRef();
    const { gl, size, viewport } = useThree();
    const videoTexture = useVideoTexture(dancingFigureVideo);
    const flowerTextureObj = useLoader(TextureLoader, flowerTexture);
    const textTextureObj = useLoader(TextureLoader, textTexture);

    const width = viewport.width;
    const height = viewport.height;

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: [-100.0, -100.0] },
        videoTex: { value: videoTexture },
        flowerTex: { value: flowerTextureObj },
        textTex: { value: textTextureObj }
    }), [videoTexture, flowerTextureObj, textTextureObj]);

    //* Resize - necessary for all threejs canvas pieces
    useEffect(() => {
        const scale = window.globalScale;
        gl.setPixelRatio(window.devicePixelRatio);
        gl.setSize(size.width / scale, size.height / scale, true);
    }, [size, gl]);

    //* Time - necessary for all threejs canvas pieces (if used in shader)
    useFrame(({ clock }) => {
        if (material.current) {
            material.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    //* Pointer position - necessary for all threejs canvas pieces (if used in shader)
    useFrame(({ pointer }) => {
        if (material.current) {
            const mult = window.globalScale * .5;
            const offset = .5 * window.globalScale;
            material.current.uniforms.uMouse.value = [
                pointer.x * mult + offset,
                pointer.y * mult + 1.0 - offset
            ];
        }
    });

    if (!videoTexture || !flowerTextureObj || !textTextureObj) return null;

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[width, height]} />
            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

const App_AdaFlower = new Application('Flower');
App_AdaFlower.anyKeyToClose = true;
App_AdaFlower.examine = () => "\"by Ada\"";
App_AdaFlower.draw = () => {
    return (
        <div className="app">
            <Canvas>
                <Art />
            </Canvas>
        </div>
    );
};
export default App_AdaFlower;