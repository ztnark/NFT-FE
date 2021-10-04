import React, {useState} from 'react';
import {Box, Flex, Image} from "rebass";
import {
    Label,
    Input,
    Select,
} from '@rebass/forms'
import {FormButton} from "../Button";
import {connect} from "react-redux";
import {connectWallet} from "../../redux/actions/metaData";
import {BoldText, SmallHeading} from '../Text'
import {ethers} from "ethers";
import crankArtifact from "../../contracts/CrankToken.json";
import contractAddress from "../../contracts/contract-address.json";


const BuyForm = ({connectWallet, metaData}) => {

    const [amountToBuy, setAmountToBuy] = useState(1);

    const handleChange = e => {
        setAmountToBuy(e.target.value);
    };

    const crankContract = new ethers.Contract(
        contractAddress.DeckNFT,
        crankArtifact.abi,
        metaData.signer
    );
    

    return (
        <Box
            as='form'
            onSubmit={e => e.preventDefault()}
            py={3}>
            <Flex mx={-2} mb={3}>
                <Box width={3 / 3} px={2}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Label htmlFor='amount'><BoldText>NFTs</BoldText></Label>
                        <Input
                            id='amount'
                            name='amount'
                            value={amountToBuy}
                            width={100}
                            type="number" //if we do number then user cant enter decimals :(
                            textAlign="right"
                            onChange={handleChange}
                        />
                    </Box>
                </Box>
            </Flex>
            <Flex mx={-2} mb={3}>
                <Box width={1} px={2}>

                </Box>
            </Flex>
            {!metaData.userAddress &&
                <FormButton onClick={(() => {
                    connectWallet(metaData.web3Modal)
                })}>
                    CONNECT WALLET
                </FormButton>

            }
            {metaData.userAddress && 
                <FormButton onClick={(async () => {
                    const networkId = metaData.provider._network.chainId;
                    if(networkId !== 1) {
                        alert("Incorrect Network. Please connect to Mainnet.")
                        return;
                    }
                    const qty = amountToBuy;
                    const total = ethers.utils.parseEther("0.0009").mul(qty);
                    const gasLimit = 230638 * qty;
                    crankContract.mintDeck(qty, {value: total, gasLimit: gasLimit});
                })}>
                    BUY
                </FormButton>
            }
        </Box>
    )
}

const mapStateToProps = (state) => {
    return {
        metaData: state.metaData
    }
}

export default connect(mapStateToProps, {connectWallet})(BuyForm);
