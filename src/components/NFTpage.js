import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [listPrice, updateListPrice] = useState();
const [royalty, updateRoyalty] = useState(0);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");
const [contract, updateContract] = useState();

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let newContract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    const tokenURI = await newContract.tokenURI(tokenId);
    const listedToken = await newContract.getListedTokenForId(tokenId);

    updateListPrice(ethers.utils.formatEther(ethers.BigNumber.from(await newContract.listPrice())));
    updateRoyalty(ethers.BigNumber.from(await newContract.royaltyFee()).toNumber() / 10000);

    console.log(royalty)
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: meta.price,
        tokenId: tokenId,
        owner: listedToken.owner,
        currentlyListed: listedToken.currentlyListed,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
    updateContract(newContract);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        if (!contract) {
            throw new Error('no contract connection is initialized!')
        }
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        const listPriceFormatted = ethers.utils.parseUnits(listPrice, 'ether')
        const royaltyPrice = salePrice.div(1 / royalty)

        const finalPrice = salePrice.add(listPriceFormatted).add(royaltyPrice);

        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value : finalPrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

async function listExistingNFT(tokenId) {
    try {
        if (!contract) {
            throw new Error('no contract connection is initialized!')
        }

        updateMessage("Listing the NFT... Please Wait (Upto 5 mins)")
        
        let transaction = await contract.listExistingNFT(tokenId);
        await transaction.wait();

        alert('You successfully listed the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

async function unlistExistingNFT(tokenId) {
    try {
        if (!contract) {
            throw new Error('no contract connection is initialized!')
        }

        updateMessage("Unlisting the NFT... Please Wait (Upto 5 mins)")
        
        let transaction = await contract.unlistExistingNFT(tokenId);
        await transaction.wait();

        alert('You successfully unlisted the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{`${data.price} ETH + ${listPrice} ETH for listing + ${Number(data.price) * royalty} ETH as royalty`}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                    { currAddress == data.owner ?
                        <div className="text-emerald-700">You are the owner of this NFT</div>
                        : (data.currentlyListed ? <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button> : <div className="text-emerald-700">The item is not listed on a sale yet.</div> )
                    }

                    { currAddress == data.owner ? (data.currentlyListed ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => unlistExistingNFT(tokenId)}>Unlist this NFT</button> 
                        : <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => listExistingNFT(tokenId)}>List this NFT</button>): null
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}