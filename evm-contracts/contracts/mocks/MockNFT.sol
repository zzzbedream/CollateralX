// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockNFT
/// @notice Mock ERC-721 representing PYMES collateral assets (machinery, vehicles, etc.).
///         Each token stores on-chain metadata used by the Stylus valuator.
contract MockNFT is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;

    /// @notice On-chain metadata for each collateral asset
    struct AssetMetadata {
        uint8 assetType;      // 0=machinery, 1=vehicle, 2=real-estate
        uint64 initialValue;  // Purchase value in minor units (e.g. cents)
        uint64 purchaseDate;  // UNIX timestamp of original purchase
        uint8 riskScore;      // Risk rating 0–100
    }

    /// @notice tokenId → asset metadata
    mapping(uint256 => AssetMetadata) public assetMetadata;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint8 assetType,
        uint64 initialValue,
        uint64 purchaseDate,
        uint8 riskScore
    );

    constructor() ERC721("CollateralX Asset", "CXA") Ownable(msg.sender) {}

    /// @notice Simplified mint for demo/testnet — anyone can mint with default metadata
    /// @dev Creates an NFT with default machinery params so the Stylus valuator works
    function mint(address to, uint256 tokenId) external {
        _safeMint(to, tokenId);
        assetMetadata[tokenId] = AssetMetadata({
            assetType: 0,                                    // machinery
            initialValue: 350_000_00,                        // $350,000 in cents
            purchaseDate: uint64(block.timestamp - 180 days),// 6 months old
            riskScore: 25                                    // low risk
        });
        emit AssetMinted(tokenId, to, 0, 350_000_00, uint64(block.timestamp - 180 days), 25);
    }

    /// @notice Mint a new collateral NFT with asset metadata
    /// @param to         Recipient address
    /// @param assetType  Category of the asset
    /// @param initialValue Original purchase value
    /// @param purchaseDate UNIX timestamp of purchase
    /// @param riskScore  Risk rating 0–100
    /// @return tokenId   The newly minted token ID
    function mintAsset(
        address to,
        uint8 assetType,
        uint64 initialValue,
        uint64 purchaseDate,
        uint8 riskScore
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        assetMetadata[tokenId] = AssetMetadata({
            assetType: assetType,
            initialValue: initialValue,
            purchaseDate: purchaseDate,
            riskScore: riskScore
        });

        emit AssetMinted(tokenId, to, assetType, initialValue, purchaseDate, riskScore);
        return tokenId;
    }

    // ── Required overrides for ERC721Enumerable ──────────────────────────

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
