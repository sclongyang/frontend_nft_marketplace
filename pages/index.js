import NFTBox from "../components/NFTBox";
import {useMoralis} from "react-moralis"
import { useQuery } from "@apollo/client";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";
import networkMapping from "../constants/networkMapping.json"


export default function Home() {
  const {isWeb3Enabled, chainId} = useMoralis()
  const {loading, error, data: listedNfts} = useQuery(GET_ACTIVE_ITEMS)

  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainString].NFTMarketplace[0]

  return (
   <div>
  {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            console.log(nft)
                            const { price, nftAddress, tokenId, seller } = nft
                            return (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${nftAddress}${tokenId}`}
                                />
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
   </div>
  )
}
