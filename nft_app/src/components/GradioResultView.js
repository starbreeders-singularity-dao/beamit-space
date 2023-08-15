// GradioResultView.js
import React, { Suspense } from 'react';
import { Canvas } from 'react-three-fiber'
import { OrbitControls, Html, Loader } from '@react-three/drei'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";

function Model({ url }) {
  const gltf = useLoader(GLTFLoader, url)
  return <primitive object={gltf.scene} />
}

const GradioResultView = ({ gradioResults }) => (
  <div>
    {gradioResults.map((result, index) => (
      <div>
        <h2>Gradio API {index} Result</h2>
        <Canvas camera={{ position: [0, 0, 10] }}>
          <OrbitControls />
          <Suspense fallback={<Html>Loading...</Html>}>
            <Model url={result} />
          </Suspense>
        </Canvas>
      </div>
    ))}
  </div>
);

export default GradioResultView;