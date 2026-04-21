import React from "react";
import * as THREE from "three";
import { useTexture, useGLTF } from '@react-three/drei';
import {SINGLE, DOUBLE, TUXEDO} from "../../../constants/SuitTypes"

const COLOR_MAP = {
    'navy blue': '#1a237e', 'white': '#f5f5f5', 'light grey': '#b0b0b0',
    'beige': '#d4b896', 'cream': '#fffdd0', 'sky blue': '#87ceeb',
    'black': '#111111', 'burgundy': '#800020', 'dark green': '#013220',
};

function hexToDataUrl(hex) {
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 4;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 4, 4);
    return canvas.toDataURL();
}

function SuitMaterial({ colorMap_src, fabricColor }) {
    const isReal = colorMap_src && !colorMap_src.includes('default_fabric');
    const color = COLOR_MAP[fabricColor?.toLowerCase()] || fabricColor?.toLowerCase() || '#888888';
    const src = isReal ? colorMap_src : hexToDataUrl(color);

    const colorMap = useTexture(src);

    if (isReal) {
        colorMap.repeat.set(5, 5);
        colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
    }

    return <meshPhysicalMaterial map={colorMap} specularIntensity={0.1} sheen={0.5} roughness={0.6} />;
}

export function Suit({ colorMap_src, suitType, fabricColor }) {
    useGLTF.preload(`${SINGLE}.glb`);
    useGLTF.preload(`${DOUBLE}.glb`);
    useGLTF.preload(`${TUXEDO}.glb`);

    const { nodes, materials } = useGLTF(`${suitType}.glb`);

    return (
        <group dispose={null}>
            <mesh castShadow receiveShadow geometry={nodes.Suit_Base.geometry}>
                <SuitMaterial colorMap_src={colorMap_src} fabricColor={fabricColor} />
            </mesh>

            <mesh castShadow receiveShadow geometry={nodes.Collar.geometry}
                position={[0, 1.1, 0.701]} rotation={[Math.PI / 2, 0, 0]}>
                {suitType !== TUXEDO
                    ? <SuitMaterial colorMap_src={colorMap_src} fabricColor={fabricColor} />
                    : <meshPhysicalMaterial color={new THREE.Color(0)} />}
            </mesh>

            {suitType === SINGLE ? <>
                <mesh castShadow receiveShadow geometry={nodes.Button01.geometry} material={materials.black_red_strip}
                    position={[0.009, 0.062, 0.85]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
                <mesh castShadow receiveShadow geometry={nodes.Button01.geometry} material={materials.black_red_strip}
                    position={[0.024, -0.545, 0.810]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
            </> : suitType === DOUBLE ? <>
                <mesh castShadow receiveShadow geometry={nodes.Button01.geometry} material={materials.black_red_strip}
                    position={[-0.276, -0.13, 0.845]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
                <mesh castShadow receiveShadow geometry={nodes.Button02.geometry} material={materials.black_red_strip}
                    position={[-0.261, -0.597, 0.82]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
                <mesh castShadow receiveShadow geometry={nodes.Button03.geometry} material={materials.black_red_strip}
                    position={[0.072, -0.13, 0.831]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
                <mesh castShadow receiveShadow geometry={nodes.Button04.geometry} material={materials.black_red_strip}
                    position={[0.087, -0.597, 0.807]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
            </> : <>
                <mesh castShadow receiveShadow geometry={nodes.Button01.geometry} material={materials.black}
                    position={[0.071, -0.614, 0.819]} rotation={[1.572, 0.006, -0.1]} scale={[0.045, 0.007, 0.045]} />
            </>}

            <mesh castShadow receiveShadow geometry={nodes.Shirt.geometry} material={materials.Material}
                position={[0.004, 0.718, 0.513]} rotation={[1.203, -0.033, -0.012]} scale={1.258} />
        </group>
    );
}
