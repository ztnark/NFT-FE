import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import {CONNECT_SIGNER_AND_PROVIDER, SET_CONTRACT_LOADING, INITIALIZE_CONTRACT, RESET_DAPP, INITIALIZE_WEBTHREE_MODAL} from "./types";
import {ethers} from "ethers";

import contractAddress from "../../contracts/contract-address.json";
import crankArtifact from "../../contracts/CrankToken.json";
import registrarArtifact from "../../contracts/SignatureRegistrar.json";
import nftArtifact from "../../contracts/SouljaNFT.json";

const clearWeb3ModalCache = (web3Modal) => {
  web3Modal.clearCachedProvider();
  localStorage.removeItem('walletconnect');
}

const fetchPrettyName = async (currentUserAddress, provider) => {
  return currentUserAddress
  ? await provider.lookupAddress(currentUserAddress) || currentUserAddress.substring(0,13) + "…"
  : '0x0'
}

export const connectWallet = (web3Modal) => async dispatch => {
    try {
        web3Modal.connect();

        web3Modal.on('connect', async (web3Provider) => {
          //const userAddress = (await web3.eth.getAccounts())[0];
          const provider = new ethers.providers.Web3Provider(web3Provider);
          const signer = provider.getSigner(0);
          const userAddress = await signer.getAddress();
          const prettyUserAddress = await fetchPrettyName(userAddress, provider)
          dispatch({
              type: CONNECT_SIGNER_AND_PROVIDER,
              payload: {
                  provider,
                  signer,
                  userAddress,
                  prettyUserAddress
              }
          });

          web3Provider.on('disconnect', async (error) => {
            clearWeb3ModalCache(web3Modal)
            dispatch({type: RESET_DAPP});
          });
          // TODO We reset the dapp state if the network is changed
          //dispatch({type: RESET_DAPP});
          web3Provider.on('accountsChanged', async (accounts) => {
            const newAddress = accounts[0];
            console.log("Account change", newAddress);
            // `accountsChanged` event can be triggered with an undefined newAddress.
            // This happens when the user removes the Dapp from the "Connected
            // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
            // To avoid errors, we reset the dapp state
            if (newAddress === undefined) {
                return resetDapp();
            }
            const newPrettyUserAddress = await fetchPrettyName(userAddress, provider)
            dispatch({
                type: CONNECT_SIGNER_AND_PROVIDER,
                payload: {
                    provider,
                    signer,
                    userAddress: newAddress,
                    prettyUserAddress: newPrettyUserAddress
                }
            });
          });
        });
    } catch (error) {
        console.log(error);
    }
};

export const initializeContract = (signer) => async dispatch => {
    try {
        dispatch({
            type: SET_CONTRACT_LOADING,
            payload: {
                loading: true
            }
        });
        const crankContract = new ethers.Contract(
            contractAddress.DeckNFT,
            crankArtifact.abi,
            signer
        );
        dispatch({
            type: INITIALIZE_CONTRACT,
            payload: {
                crankContract: crankContract,
            }
        });
    } catch (error) {
        console.log(error);
    }
};

export const initializeWeb3Modal = () => async dispatch => {
  try {
      const web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: '3b64549aefab4be78ce30e30cb9fad7c'
            },
          },
        },
      });
      dispatch({
          type: INITIALIZE_WEBTHREE_MODAL,
          payload: {
              web3Modal: web3Modal
          }
      });
  } catch (error) {
      console.log(error);
  }
}

export const resetDapp = () => async dispatch => {
    try {
        dispatch({type: RESET_DAPP});
    } catch (error) {
        console.log(error);
    }
};
