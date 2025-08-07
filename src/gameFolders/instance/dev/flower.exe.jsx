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
    const { viewport } = useThree();
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

    useFrame(({ clock, pointer }) => {
        if (material.current) {
            material.current.uniforms.uTime.value = clock.getElapsedTime();
            material.current.uniforms.uMouse.value = [
                pointer.x * 0.5 + 0.5,
                pointer.y * 0.5 + 0.5
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