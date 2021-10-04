import React, {useState, useEffect} from "react";
import {Box, Flex, Image, Link} from "rebass";
import {Heading, SmallHeading, Text, SmallBoldText, BoldText} from './Text'
import {BuyButton, RedeemButton, SellButton} from "./Button";
import {connect} from "react-redux";
import {connectWallet} from "../redux/actions/metaData";
import {Modal} from "./Modal"
import BuyForm from "./forms/BuyForm"
import SellForm from "./forms/SellForm"
import RedeemForm from "./forms/RedeemForm"
import {ExternalLink, X} from 'react-feather';
import styled from 'styled-components';
import {ethers} from "ethers";
import crankArtifact from "../contracts/CrankToken.json";
import contractAddress from "../contracts/contract-address.json";

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
`

const souljaBoyProfilePicture = <Image
    src={process.env.PUBLIC_URL + "/punk.png"}
    sx={{
        width: 32,
        height: 32,
        borderRadius: 9999,
        marginLeft: 24,
        marginRight: 10,
    }}
/>;

const crankThatPicture = <Image
    src={process.env.PUBLIC_URL + "/deck.jpg"}
    sx={{
        //width: ['100%', '50%'],
        width: 450,
        borderRadius: 8,
    }}
/>;

const DataField = ({title, data, url}) => {
    return (<>
        <SmallBoldText>{title}</SmallBoldText>
        {url
            ? <StyledLink href={url}><BoldText sx={{fontWeight: 700}}>{data}<ExternalLink
                size={16}/></BoldText></StyledLink>
            : <BoldText sx={{fontWeight: 700}}>{data}</BoldText>}
    </>)
}


const AlbumDashboard = ({connectWallet, metaData}) => {
    const [supply, setSupply] = useState(0);
    const [price, setPrice] = useState(0);
    const [total, setTotal] = useState(0);


    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);

    let crankContract;

    if(metaData.signer) {
        crankContract = new ethers.Contract(
            contractAddress.DeckNFT,
            crankArtifact.abi,
            metaData.signer
        );
    } else {
        let provider = new ethers.providers.AlchemyProvider("rinkeby", 'Ull-HRoY0D3yB_pSBBiigDHA4shl7DJr');
        crankContract = new ethers.Contract(
            contractAddress.DeckNFT,
            crankArtifact.abi,
            provider
        );
    }


    useEffect(() => {
        if (!supply) {
            getSupply();
            getTotal();
            getPrice();
        }
      }, []);

    const getSupply = async () => {
        const val = await crankContract.totalSupply();
        setSupply(val.toNumber())
    }

    const getTotal = async () => {
        const total = await crankContract['MAX_DECK']();
        setTotal(total.toNumber())
    }

    const getPrice = async () => {
        const price = await crankContract['MINT_FEE_PER_TOKEN']();
        setPrice(ethers.utils.formatEther(price))
    }

    return (
        <Flex marginBottom={120}>
            <Box
                p={3}
                width={1 / 2}
                color='#6F6F6F'
                bg='primary'
                paddingRight={76}>
                <Heading>
                    Sammy's Full Deck
                </Heading>
                <SmallHeading>
                    <span style={{display: "flex", alignItems: "center"}}>By {souljaBoyProfilePicture} Sammy</span>
                </SmallHeading>
                <Text marginBottom={20}>
                <p>This NFT is a token that entitles you to 1 real deck of Sammy's RSOP playing cards, shipped anywhere in the world.</p>

                <p>You can sell the token on OpenSea at any time, or, to get a real deck, redeem the NFT. The redemption period will begin in about 2 months.</p>
                </Text>
                <Flex
                    marginBottom={48}>
                    <Box
                        width={1 / 3}
                        color="black"
                        bg="primary"
                        paddingTop={28}
                        paddingLeft={0}>
                        <DataField title="Price" data={price + " ETH"}/>
                    </Box>
                    <Box
                        width={1 / 3}
                        color="black"
                        bg="primary"
                        paddingTop={28}>
                        <DataField title="Total Sold" data={supply + '/' + total}/>
                    </Box>
                    <Box
                        width={1 / 3}
                        color="black"
                        bg="primary"
                        paddingTop={28}>
                        <DataField title="NFT Contract" data={contractAddress.DeckNFT.slice(0,5) + '...'} url="https://rinkeby.etherscan.io/address/0x372ee36a44947d2ad8fea0655747d48642ad55eb"/>
                    </Box>
                    <Box
                        width={1 / 3}
                        color="black"
                        bg="primary"
                        paddingTop={28}
                        paddingLeft={28}
                        paddingRight={0}>
                        <DataField title="OpenSea" data={"0xeb08c28b93f17d19fafce65941877803fea14583".slice(0,5) + '...'} url="https://opensea.io/0xeb08c28b93f17d19fafce65941877803fea14583"/>
                    </Box>
                    
                </Flex>
                <BuyButton onClick={() => setShowBuyModal(true)}>
                    BUY
                </BuyButton>
            </Box>
            <Box
                p={3}
                width={1 / 2}
                color='#6F6F6F'
                // bg='#F1F2F6'
                sx={{
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column"
                }}>
                {crankThatPicture}
            </Box>
            <Modal isOpen={showBuyModal} onDismiss={() => setShowBuyModal(false)}>
                <StyledLink href="javascript:void(0);" onClick={() => setShowBuyModal(false)}><X/></StyledLink>
                <BuyForm/>
            </Modal>
            <Modal isOpen={showSellModal} onDismiss={() => setShowSellModal(false)}>
                <StyledLink href="javascript:void(0);" onClick={() => setShowSellModal(false)}><X/></StyledLink>
                <SellForm/>
            </Modal>
            <Modal isOpen={showRedeemModal} onDismiss={() => setShowRedeemModal(false)}>
                <StyledLink href="javascript:void(0);" onClick={() => setShowRedeemModal(false)}><X/></StyledLink>
                <RedeemForm/>
            </Modal>
        </Flex>
    );
}

const mapStateToProps = (state) => {
    return {
        metaData: state.metaData
    }
}

export default connect(mapStateToProps, {connectWallet})(AlbumDashboard);