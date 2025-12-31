import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';

// Standard ERC-721 ABI for balanceOf
const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface UseNFTOwnershipOptions {
  contractAddress: Address;
  chainId?: number;
  enabled?: boolean;
}

interface NFTOwnershipResult {
  hasNFT: boolean;
  balance: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to check if the connected wallet owns an NFT from a specific contract
 */
export function useNFTOwnership({
  contractAddress,
  chainId = 1, // Default to mainnet
  enabled = true,
}: UseNFTOwnershipOptions): NFTOwnershipResult {
  const { address, isConnected } = useAccount();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: ERC721_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: enabled && isConnected && !!address,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  });

  return {
    hasNFT: balance !== undefined && balance > BigInt(0),
    balance,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to check ownership of multiple NFT contracts
 */
export function useMultiNFTOwnership(
  contracts: { address: Address; chainId?: number }[]
) {
  const { address, isConnected } = useAccount();

  // For simplicity, we'll check the first contract
  // In production, you'd want to use multicall or multiple queries
  const firstContract = contracts[0];
  
  const result = useNFTOwnership({
    contractAddress: firstContract?.address ?? '0x0000000000000000000000000000000000000000',
    chainId: firstContract?.chainId,
    enabled: isConnected && !!address && contracts.length > 0,
  });

  return {
    ...result,
    contracts,
  };
}

// Example NFT contract addresses (these would come from tenant config)
export const NFT_CONTRACTS = {
  drGreenKey: '0x0000000000000000000000000000000000000000' as Address, // Placeholder
  healingBudsAccess: '0x0000000000000000000000000000000000000000' as Address, // Placeholder
} as const;
