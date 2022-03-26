import { useState, useEffect } from 'react'
import { ethers, utils } from 'ethers'
import abi from './contracts/KuicCoin.json'
import Loader from './components/Loader'

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [inputValue, setInputValue] = useState({
    walletAddress: '',
    transferAmount: '',
    burnAmount: '',
    mintAmount: '',
  })
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0)
  const [isTokenOwner, setIsTokenOwner] = useState(false)
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null)
  const [yourWalletAddress, setYourWalletAddress] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const contractABI = abi.abi
  const contractAddress = '0x1d11282080B88C1e72570a2C46b69e55a0F460F2'
  const { ethereum } = window

  const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    )
    return tokenContract
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (ethereum) {
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        })
        const account = accounts[0]
        setIsWalletConnected(true)
        setYourWalletAddress(account)
        console.log('Account Connected', account)
      } else {
        setError('Install a MetaMask wallet to get our token')
        console.log('No Metamask detected!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTokenInfo = async () => {
    try {
      if (ethereum) {
        const tokenContract = getEthereumContract()
        const [account] = await ethereum.request({
          method: 'eth_requestAccounts',
        })
        let tokenName = await tokenContract.name()
        let tokenSymbol = await tokenContract.symbol()
        let tokenOwner = await tokenContract.owner()
        let tokenSupply = await tokenContract.totalSupply()
        tokenSupply = utils.formatEther(tokenSupply)

        setTokenName(`${tokenName} 👛`)
        setTokenSymbol(tokenSymbol)
        setTokenTotalSupply(tokenSupply)
        setTokenOwnerAddress(tokenOwner)

        if (account.toLowrCase() === tokenOwner.toLowrCase()) {
          setIsTokenOwner(true)
        }
        console.log('Token Name: ', tokenName)
        console.log('Token Symbol: ', tokenSymbol)
        console.log('Token Supply: ', tokenSupply)
        console.log('Token Owner: ', tokenOwner)
      } else {
        setError('Install a MetaMask wallet to get our token')
        console.log('No Metamask detected!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const transferTokens = async (e) => {
    e.preventDefault()
    try {
      if (ethereum) {
        const tokenContract = getEthereumContract()
        const txn = await tokenContract.transfer(
          inputValue.walletAddress,
          utils.parseEther(inputValue.transferAmount)
        )
        console.log('Transfering Tokens...')
        setLoading(true)
        await txn.wait()
        console.log('Tokens Transferred Successfully', txn.hash)
        setLoading(false)
      } else {
        setError('Install a MetaMask wallet to get our token')
        console.log('No Metamask detected!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const burnTokens = async (e) => {
    e.preventDefault()
    try {
      if (ethereum) {
        const tokenContract = getEthereumContract()
        const txn = await tokenContract.burn(
          utils.parseEther(inputValue.burnAmount)
        )
        console.log('Burning Tokens...')
        setLoading(true)
        await txn.wait()
        console.log('Tokens burned...', txn.hash)
        setLoading(false)
        let tokenSupply = await tokenContract.totalSupply()
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply)
      } else {
        setError('Install a MetaMask wallet to get our token')
        console.log('No Metamask detected!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  // mint additional new tokens
  const mintTokens = async (e) => {
    e.preventDefault()
    try {
      if (ethereum) {
        const tokenContract = getEthereumContract()
        let tokenOwner = await tokenContract.owner()
        const txn = await tokenContract.mint(
          tokenOwner,
          utils.parseEther(inputValue.mintAmount)
        )
        console.log('Minting Additional Tokens...')
        setLoading(true)
        await txn.wait()
        console.log('Additional Tokens minted...', txn.hash)
        setLoading(false)

        let tokenSupply = await tokenContract.totalSupply()
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply)
      } else {
        setError('Install a MetaMask wallet to get our token')
        console.log('No Metamask detected!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (e) => {
    setInputValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    getTokenInfo()
  }, [])

  return (
    <div className='min-h-screen gradient-bg-welcome text-center pt-7'>
      <h2 className='text-3xl sm:text-5xl text-white text-gradient py-1'>
        KuicCoin Project
      </h2>
      <section className='flex flex-col w-full justify-center items-center'>
        {error && <p className='text-white font-light text-base'>{error}</p>}
        {loading && <Loader />}

        <div className='mt-5 mb-9 text-white'>
          <span className='mx-5'>
            <strong>Coin:</strong> {tokenName}
          </span>
          <span className='mx-5'>
            <strong>Symbol:</strong> {tokenSymbol}
          </span>
          <span className='mx-5'>
            <strong>Total Supply:</strong> {tokenTotalSupply}
          </span>
        </div>
        <div>
          <form>
            <input
              required
              type='text'
              onChange={handleInputChange}
              name='walletAddress'
              placeholder='Enter Wallet Address'
              value={inputValue.walletAddress}
              className='my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
            />
            <input
              required
              type='text'
              onChange={handleInputChange}
              name='transferAmount'
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
              className='my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
            />
            <button
              className='text-white mt-2 bg-[#2952e3] px-4 py-1 justify-center items-center'
              onClick={transferTokens}
            >
              {loading ? 'Transfering ...👛' : 'Transfer Tokens 👛'}
            </button>
          </form>
        </div>
        {isTokenOwner && (
          <section>
            <div className='mt-7 mb-9'>
              <form>
                <input
                  type='text'
                  onChange={handleInputChange}
                  name='burnAmount'
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                  className='my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
                />
                <button
                  className='text-white mt-2 bg-[#2952e3] px-4 py-1 justify-center items-center'
                  onClick={burnTokens}
                >
                  {loading ? 'Burning...🔥' : 'Burn Tokens 🔥'}
                </button>
              </form>
            </div>
            <div className='mt-7 mb-9'>
              <form>
                <input
                  type='text'
                  onChange={handleInputChange}
                  name='mintAmount'
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                  className='my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
                />
                <button onClick={mintTokens}>
                  {loading ? 'Minting Tokens...👛' : 'Mint Tokens 👛'}
                </button>
              </form>
            </div>
          </section>
        )}
        <div className='mt-5'>
          <p className='text-white'>
            <span className='font-bold'>Contract Address: </span>
            {contractAddress}
          </p>
        </div>
        <div className='mt-5'>
          <p className='text-white'>
            <span className='font-bold'>Token Owner Address: </span>
            {tokenOwnerAddress &&
              `${tokenOwnerAddress.slice(0, 5)}...${tokenOwnerAddress.slice(
                tokenOwnerAddress.length - 4
              )}`}
          </p>
        </div>
        <div className='mt-5'>
          {isWalletConnected && (
            <p className='text-white mb-4'>
              <span className='font-bold'>Your Wallet Address:</span>{' '}
              {yourWalletAddress &&
                `${yourWalletAddress.slice(0, 5)}...${yourWalletAddress.slice(
                  yourWalletAddress.length - 4
                )}`}
            </p>
          )}
          <button className='text-white mt-2 bg-[#2952e3] px-4 py-1 justify-center items-center'>
            {isWalletConnected ? 'Wallet Connected 🔐' : 'Connect Wallet 🔑'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default App
