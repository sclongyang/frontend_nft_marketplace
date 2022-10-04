import {useNotification, Card } from "web3uikit"
import Image from "next/image"
import { useMoralis, useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NFTMarketplace.json"
import baseNFTAbi from "../constants/BaseNFT.json"
import { useState, useEffect } from "react"
import UpdatePriceModal from "./UpdateItemModal"
import {ethers} from 'ethers'

export default function NFTBox({price ,tokenId, seller,  nftAddress, marketplaceAddress}){
    const {account, isWeb3Enabled} = useMoralis()
    const {runContractFunction} = useWeb3Contract()
    const dispatch = useNotification()

    const [tokenName, setTokenName] = useState("")
    const [tokenDesc, setTokenDesc] = useState("")
    const [imageURL, setImageURL] = useState("")
    const [showModal, setShowModal] = useState(false)    

    const isNFTOwner = account.toLowerCase() === seller.toLowerCase()? true: false

    const updateState = async()=>{        
        const uri = await getTokenURI() //  ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json
        console.log(`tokenURI:${uri}`)
        if(uri){
            const httpURL = uri.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResp = await (await fetch(httpURL)).json()
            /*
            {
                "name": "SHIBA_INU",
                "description": "An adorable SHIBA_INU pup!",
                "image": "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU?filename=shiba-inu.png",
                "attributes": [
                    {
                        "trait_type": "cuteness",
                        "value": 100
                    }
                ]
            }
            */
            const imageURL = tokenURIResp.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            setTokenName(tokenURIResp.name)
            setImageURL(imageURL)
            setTokenDesc(tokenURIResp.description)            
        }
    }

    useEffect(()=>{        
        if(isWeb3Enabled){
            updateState()
        }
    }, [isWeb3Enabled])

    /*getTokenURI: 
    {
    "name": "SHIBA_INU",
    "description": "An adorable SHIBA_INU pup!",
    "image": "https://ipfs.io/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU?filename=shiba-inu.png",
    "attributes": [
        {
            "trait_type": "cuteness",
            "value": 100
        }
    ]
    }
    */
    const getTokenURI = async ()=>{
        const successMsg = "getTokenURI success"
        const title = "getTokenURI resp"
        console.log(`start getTokenURI`)
        return await runContractFunction({
            params:{
                contractAddress: nftAddress,
                abi: baseNFTAbi,
                functionName: "tokenURI",                
                params: {
                    tokenId: tokenId
                }
            }
        })
    }

    const handleCardClick = async ()=>{       
        if(isNFTOwner){
           setShowModal(true)
        }else{
            //buy nft
            const successMsg = "buy nft success"
            const title = "buy nft resp"
            await runContractFunction({
                params: {
                    contractAddress: marketplaceAddress,
                    abi: nftMarketplaceAbi,
                    functionName: "buyNFT",
                    msgValue: price,
                    params: {
                        nftAddress: nftAddress,
                        tokenId: tokenId
                    }
                },
                onSuccess: ()=>handleCallBack(true, successMsg, title),
                onError: (e)=>handleCallBack(false, successMsg, title, e)
            })
        }
    }   

    const handleCallBack = (isSuccess, successMsg, title, errMsg)=>{
        const msg = isSuccess?successMsg:errMsg
        console.log(msg)
        dispatch({
            type: isSuccess?"success":"error",
            message: msg,
            title: title,
            position: "topR"
        })
    }
    
    return (
        <div>            
             {   imageURL ?
                (<div>
                        <UpdatePriceModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={()=>setShowModal(false)}
                        />                        
                        <Card
                            title={tokenName}
                            description={tokenDesc}        
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {seller}
                                    </div>
                                    <Image
                                        loader={() => imageURL}
                                        src={imageURL}
                                        height="200"
                                        width="200"
                                    />
                                    <div>
                                        {ethers.utils.formatEther(price)} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>      
                </div>)
                    :
                 (<div>Loading...</div>)   
             }         
        </div>        
    )
}