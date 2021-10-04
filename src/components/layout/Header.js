import React from 'react';
import './Header.css';
import ConnectWallet from "./ConnectWallet";

const Header = () => {
    return (
        <div className="Header">
            <h2>IRL NFTs</h2>
            <div style={{flexGrow: 1}}/>
            <ConnectWallet/>
        </div>
    );
};

export default Header;
