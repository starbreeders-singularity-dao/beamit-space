// NFTList.js
import React from 'react';

const NFTList = ({ nfts, setSelectedNFT }) => (
  <div>
    {nfts.map(nft => (
      <div key={nft.token_id} onClick={() => setSelectedNFT(nft.image_url)} style={{cursor: 'pointer'}}>
        <img src={nft.image_url} alt={nft.name}/>
        <p>{nft.name}</p>
      </div>
    ))}
  </div>
);

export default NFTList;