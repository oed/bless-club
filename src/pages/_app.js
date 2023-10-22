import '@styles/globals.scss'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { ComposeDB } from '../hooks/useComposeDB'

import { WagmiConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const PROJECT_ID = '00c25db8236fa2a83d2093c80dbcfa7a'

const chains = [mainnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId: PROJECT_ID, appName: 'Web3Modal' })
createWeb3Modal({ wagmiConfig, projectId: PROJECT_ID, chains, themeMode: 'light' })

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ComposeDB>
        <Component {...pageProps} />
      </ComposeDB>
    </WagmiConfig>
  )
}

export default MyApp
