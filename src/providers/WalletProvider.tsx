import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig } from 'wagmi';
import { defineChain } from 'viem';

// Define Sei testnet chain
const seiTestnet = defineChain({
  id: 1328,
  name: 'Sei Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SEI',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seitrace',
      url: 'https://seitrace.com',
    },
  },
  testnet: true,
});

// Create Wagmi config
const config = createConfig({
  chains: [seiTestnet],
  transports: {
    [seiTestnet.id]: http(),
  },
});

// Create query client
const queryClient = new QueryClient();

interface WalletProviderProps {
  children: React.ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

  // If no Privy app ID is configured, provide a development-only wrapper
  if (!privyAppId || privyAppId === 'your-privy-app-id') {
    console.warn(
      '⚠️ No Privy App ID configured. Using development mode with Wagmi only.',
    );
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Customize Privy's appearance and behavior
        appearance: {
          theme: 'light',
          accentColor: '#f97316', // Orange color
        },
        // Configure login methods
        loginMethods: ['wallet'],
        // Configure supported wallets
        supportedChains: [seiTestnet],
        // Additional configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
