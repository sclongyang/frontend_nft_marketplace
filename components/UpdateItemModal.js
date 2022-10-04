import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Modal, useNotification, Input } from "web3uikit";
import nftMarketplaceAbi from "../constants/NFTMarketplace.json"
import {ethers} from "ethers"

export default function UpdatePriceModal({isVisible, marketplaceAddress, nftAddress, tokenId, onClose}){
    const [newPrice, setNewPrice] = useState("0")
    const dispatch = useNotification()
    
    const {runContractFunction:modifyPrice} = useWeb3Contract({
        contractAddress:marketplaceAddress,
        abi:nftMarketplaceAbi,
        functionName:"modifyPrice",
        params:{
            nftAddress:nftAddress,
            tokenId:tokenId,
            newPrice: ethers.utils.parseEther(newPrice)
        }        
    })

    const handleCallBack = (isSuccess, successMsg, title, errMsg)=>{
        const msg = isSuccess?successMsg:errMsg.message
        console.log(`callback:${isSuccess},${title}, ${msg}`)
        dispatch({
            type: isSuccess?"success":"error",
            message: msg,
            title: title,
            position: "topR"
        })
        onClose && onClose()
        setNewPrice("0")
    }

    return (
        
            <Modal 
                isVisible={isVisible}
                onCancel={onClose}
                onCloseButtonPressed={onClose}
                onOk={()=>{
                        const successMsg = "modify price success"
                        const title = "modify price resp"
                        modifyPrice({
                            onSuccess:()=>handleCallBack(true, successMsg, title),
                            onError: (e)=>handleCallBack(false, successMsg, title, e),
                        })
                    }                    
                }            >
                <Input
                    label="Modify NFT price (ETH)"
                    name="New price"
                    type="number"
                    onChange={(event) => {
                        setNewPrice(event.target.value)
                    }}
                />
            </Modal>
        
    )
}