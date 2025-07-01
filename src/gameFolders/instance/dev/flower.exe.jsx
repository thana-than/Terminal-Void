import React, { useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import Application from "/src/js/applicationProgram.jsx";
import fragmentShader from "/src/shaders/adaflower_fragment.glsl";
import vertexShader from "/src/shaders/vertex.glsl";
import dancingFigureVideo from '/src/assets/pexels_ron_lach_dancing_figure.mp4';
import useVideoTexture from '/src/js/hooks/useVideoTexture.js';


const Art = () => {
    const mesh = useRef();
    const material = useRef();
    const { viewport } = useThree();
    const videoTexture = useVideoTexture(dancingFigureVideo);

    const width = viewport.width;
    const height = viewport.height;

    if (!videoTexture) return null;

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[width, height]} />
            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uTexture: { value: videoTexture }
                }}
            />
        </mesh>
    );
};

const App_AdaFlower = new Application('Flower');
App_AdaFlower.examine = () => "God Turn Me Into A Flower.";
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