import React, { Suspense, useState } from "react";
import { ethers } from "ethers";
import { Canvas } from 'react-three-fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useLoader } from '@react-three/fiber'
import { OrbitControls, Html, Loader } from '@react-three/drei'
import styled from 'styled-components';
import { useGLTF } from '@react-three/drei';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #cccccc;
  }
`;

const NFTContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
`;

const NFT = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  cursor: pointer;
`;

const NFTImage = styled.img`
  width: 100px;
  height: 100px;
`;

const CanvasContainer = styled.div`
  width: 400px;
  height: 400px;
  margin-top: 20px;
`;


function Model({ url }) {
  const gltf = useGLTF(url, true, DRACOLoader);
  return <primitive object={gltf.scene} dispose={null} />;
}


const MyComponent = () => {
  const [nfts, setNfts] = useState([]);
  const [address, setAddress] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [gradioResult0, setGradioResult0] = useState([]);
  const [gradioResult1, setGradioResult1] = useState(null);
  const [gradioResult2, setGradioResult2] = useState(null);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        fetchNFTs(address);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log('Ethereum object does not exist on window.');
    }
  }

  async function fetchNFTs(address) {
    try {
      const response = await fetch(`https://api.opensea.io/api/v1/assets?owner=${address}&limit=50`, {
        headers: {
          'X-API-KEY': '0d3ed54128ab4fb699b67ddc6463e17d'
        }
      });
      
      if (!response.ok) {
        console.log('Response Error:', response);
        throw new Error('Could not fetch the data for that resource.');
      }

      const data = await response.json();
      setNfts(data.assets);
    } catch (err) {
      console.log(err);
    }
  }

  async function processImage() {
    setIsLoading(true); // Start loading when image processing begins
    try {
      const response = await fetch(selectedNFT);
      const blob = await response.blob(); // get the image as a Blob
      console.log("selectedNFT", selectedNFT)
      console.log("blob", blob)

      // Construct a FormData instance
      const formData = new FormData();
      formData.append('file', blob, 'image.png'); // add the blob to the form data
      console.log("formData", formData)
      const uploadResponse = await fetch('http://localhost:5000/process_image', {
        method: 'POST',
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      } else {
        const data = await uploadResponse.json();
        setProcessedImage(data.image_url);
        console.log(data.image_url)
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop loading when image processing ends
    }
  }

  async function callGradioApi(endpoint) {
    setIsLoading(true); // Start loading when image processing begins
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: processedImage
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const data = await response.json();
        if (endpoint === 'gradio_api_0') {
          setGradioResult0(data.gradio_result);
          console.log(data.gradio_result)
        } else if (endpoint === 'gradio_api_1') {
          setGradioResult1(data.gradio_result);
        } else if (endpoint === 'gradio_api_2') {
          setGradioResult2(data.gradio_result);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop loading when image processing ends
    }
  }



  return (
    <Container>
      <Button onClick={connectWallet}>Connect Wallet</Button>
      <Button onClick={processImage} disabled={!selectedNFT || isLoading}>Process Image</Button>
      <Button onClick={() => callGradioApi('gradio_api_0')} disabled={!processedImage || isLoading}>Call Gradio API 0</Button>
      <Button onClick={() => callGradioApi('gradio_api_1')} disabled={!processedImage || isLoading}>Call Gradio API 1</Button>
      <Button onClick={() => callGradioApi('gradio_api_2')} disabled={!processedImage || isLoading}>Call Gradio API 2</Button>
      <p>Your Ethereum address: {address}</p>
      <NFTContainer>
        {nfts.map(nft => (
          <NFT key={nft.token_id} onClick={() => setSelectedNFT(nft.image_url)}>
            <NFTImage src={nft.image_url} alt={nft.name}/>
            <p>{nft.name}</p>
          </NFT>
        ))}
      </NFTContainer>
      {isLoading ? (
        <div>Loading...</div>
      ) : processedImage && (
        <div>
          <h2>Processed Image</h2>
          <img src={processedImage} alt="Processed" />
        </div>
      )}
      {gradioResult0.length > 0 && (
        <div>
          <h2>Gradio API 0 Result</h2>
          {gradioResult0.map((result, index) => (
            <img key={index} src={result} alt={`Gradio API 0 Result ${index}`} />
          ))}
        </div>
      )}
      {gradioResult1 && (
        <CanvasContainer>
          <h2>Gradio API 1 Result</h2>
          <Canvas camera={{ position: [0, 0, 10] }}>
            <OrbitControls />
            <Suspense fallback={<Html>Loading...</Html>}>
              <Model url={gradioResult1} />
            </Suspense>
          </Canvas>
        </CanvasContainer>
      )}
      {gradioResult2 && (
        <CanvasContainer>
          <h2>Gradio API 2 Result</h2>
          <Canvas camera={{ position: [0, 0, 10] }}>
            <OrbitControls />
            <Suspense fallback={<Html>Loading...</Html>}>
              <Model url={gradioResult2} />
            </Suspense>
          </Canvas>
        </CanvasContainer>
      )}
      <Loader />
    </Container>
  );
  

      }
  export default MyComponent;