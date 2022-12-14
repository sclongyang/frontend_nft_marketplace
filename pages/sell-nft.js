import { useState, useEffect } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Button, Form, useNotification } from "web3uikit";
import networkMapping from "../constants/networkMapping.json"
import nftMarketplaceAbi from "../constants/NFTMarketplace.json"
import baseNFTAbi from "../constants/BaseNFT.json"
import {ethers} from "ethers"


export default function Sell(){
    const {account, chainId, isWeb3Enabled} = useMoralis()    
    // console.log(`chainid:${parseInt(chainId)}`)
    const chainIdStr = chainId? parseInt(chainId).toString() : "31337"    

    const marketplaceAddress = networkMapping[chainIdStr].NFTMarketplace[0]    
    const {runContractFunction} = useWeb3Contract()
    const dispatch = useNotification()    
    
    const [proceeds, setProceeds] = useState("")

    useEffect(()=>{
        if(isWeb3Enabled){
            updateState()
        }
    },[isWeb3Enabled, account, chainId, proceeds])

    const updateState = async ()=>{
        // console.log(`begin updateUI: marketplaceAddress: ${marketplaceAddress}, user:${account}`)
        const respProceeds = await runContractFunction({
            params:{
                contractAddress: marketplaceAddress,
                abi : nftMarketplaceAbi,
                functionName:"getProceeds",
                params:{
                    user: account
                }
            },            
            onError: (e)=> handleCallBack(false, "", "getProceeds", e),
        })
        if(respProceeds){
            setProceeds(respProceeds.toString())
        }
    }

    const approveAndListNFT = async(data)=>{
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseEther(data.data[2].inputResult).toString()      
        console.log(`begin approve nft`)  
        //approve
        await runContractFunction({
            params:{
                contractAddress: nftAddress,
                abi : baseNFTAbi,
                functionName:"approve",
                params:{
                    to:marketplaceAddress,
                    tokenId: tokenId,
                }
            },
            onSuccess: ()=>listNFTOnMarketplace(nftAddress, tokenId, price),
            onError: (e)=> handleCallBack(false, "", "approve nft", e),
        })
    }

    const listNFTOnMarketplace = async (nftAddress, tokenId, price)=>{
        console.log(`begin list nft`)  

        await runContractFunction({
            params:{
                contractAddress: marketplaceAddress,
                abi : nftMarketplaceAbi,
                functionName:"addItem",
                params:{
                    nftAddress:nftAddress,                    
                    tokenId:tokenId,
                    price:price
                }
            },
            onSuccess: ()=> handleCallBack(true, "list nft success", "list nft on marketplace"),
            onError: (e)=> handleCallBack(false, "", "list nft on marketplace", e),
        })
    }

    const withdrawProceeds = async()=>{
        console.log(`begin withdraw`)
        await runContractFunction({
            params:{
                contractAddress: marketplaceAddress,
                abi : nftMarketplaceAbi,
                functionName:"withdrawProceeds",                
            },
            onSuccess: ()=> handleCallBack(true, "withdraw proceeds success", "withdraw proceeds"),
            onError: (e)=> handleCallBack(false, "", "withdraw proceeds", e),
        })
    }

    const handleCallBack = (isSuccess, successMsg, title, errMsg)=>{        
        const msg = isSuccess?successMsg:errMsg.message
        console.log(`callback:${isSuccess}, ${title}, content:${msg}`)
        dispatch({
            type: isSuccess?"success":"error",
            message: msg,
            title: title,
            position: "topR"
        })
    }

    return (
        <div className="flex flex-col items-center">
            <Form 
                id="Sell Form"
                title="Sell your NFT"
                buttonConfig={{
                    theme:"colored",
                    color:"blue"
                }}               
                onSubmit={approveAndListNFT}
                data={[
                    {
                        name:"NFT Address",
                        type:"text"    ,
                        value:"",
                        key:"nftAddress",
                        inputWidth:"50%",
                    },
                    {
                        name:"TokenId",
                        type:"number"    ,
                        value:"",
                        key:"tokenId",
                    },
                    {
                        name:"Price (ETH)",
                        type:"number"    ,
                        value:"",
                        key:"price",
                    },
                ]}            
            />
            <div className="py-5 font-bold text-2xl">Withdraw {ethers.utils.formatEther(proceeds?proceeds:0)} ETH</div>
            {
                proceeds === "0"?
                (
                    <div>No proceeds</div>
                ):(
                    <Button 
                        text="Withdraw"
                        type="button"
                        color="blue"
                        theme="colored"
                        onClick={
                            ()=>withdrawProceeds()
                        }
                    />
                )
            }            
        </div>
    )
}