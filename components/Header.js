import Link from "next/link";
import { ConnectButton } from "web3uikit";

export default function Header(){
    return (
        <nav>
            <Link href="/">
                <a>Home</a>
            </Link>
            <Link href="/sell-nft">
                <a>Sell NFT</a>
            </Link>
            <ConnectButton moralisAuth={false} />
        </nav>
    )
}