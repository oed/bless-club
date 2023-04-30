import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ReactList from 'react-list';
import { ethers } from 'ethers';



import blessClubLogo from '../public/icon.png'
import { useCeramicContext } from '../context'
import { authenticateCeramic } from '../utils'
import styles from '../styles/Home.module.css'

interface Blessing {
  to: String
  text: String
  author?: String
}

const Home: NextPage = () => {
  const clients = useCeramicContext()
  const { ceramic, composeClient } = clients
  const [blessings, setBlessings] = useState<Blessing[]>([])
  const [blessing, setBlessing] = useState<Blessing | undefined>()
  const [cursor, setCursor] = useState<String>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient)
    await getBlessings()
  }

  const getBlessings = async () => {
    setLoading(true)
    if(ceramic.did !== undefined) {
      const { data: { blessingIndex: { 
        pageInfo: { hasPreviousPage },
        edges: rawBlessings
      }}} = await composeClient.executeQuery(`
      query{
        blessingIndex(last:5${cursor ? `, before: "${cursor}"` : ''}){
          edges{
            cursor
            node{
              to {id}
              text
              author {id}
            }
          }
          pageInfo {
            hasPreviousPage
          }
        }
      }
      `) as any;

      if (hasPreviousPage) {
        setCursor(rawBlessings[0].cursor)
      }
      
      const toAddress = did => did.slice(17)
      const format = ({ node }) => ({
        to: toAddress(node.to.id),
        text: node.text,
        author: toAddress(node.author.id)
      })
      // const bls = rawBlessings.reverse().map(format) 
      const bls = blessings.concat(rawBlessings.reverse().map(format))
      await setBlessings(bls)
      setLoading(false);
      fillENSNames(bls)
    }
  }

  const ensMap = {}
  const fillENSNames = async (bls) => {
    console.log('filling')
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    const fillMap = async (field, i) => {
      const address = bls[i][field]
      if (address.indexOf('.eth') !== -1) return
      if (!ensMap[address]) {
        const name = await prov.lookupAddress(address)
        ensMap[address] = name || address
      }
      if (ensMap[address] !== address) {
        bls[i][field] = ensMap[address]
        setBlessings(bls)
      }
    }
    for (let i = 0; i < bls.length; ++i) {
      await fillMap('to', i)
      await fillMap('author', i)
    }
  }
  
  const toDID = async (input: string) => {
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    if (input.startsWith('0x')) {
      return 'did:pkh:eip155:1:' + input.toLowerCase()
    } else if (input.indexOf('.eth') !== -1) {
      const address = await prov.resolveName(input)
      if (!address) {
        throw new Error('Incorrect ENS name or address')
      }
      return 'did:pkh:eip155:1:' + address.toLowerCase()
    }
    throw new Error('Incorrect ENS name or address')
  }

  const createBlessing = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const to = await toDID(blessing?.to as string)
      const update = await composeClient.executeQuery(`
        mutation {
          createBlessing(input: {
            content: {
              to: "${to}"
              text: "${blessing?.text}"
            }
          }) 
          {
            document {
              to { id }
              text
              author { id }
            }
          }
        }
      `);
      await getBlessings();
      setLoading(false);
    }
  }
  
  /**
   * On load check if there is a DID-Session in local storage.
   * If there is a DID-Session we can immediately authenticate the user.
   * For more details on how we do this check the 'authenticateCeramic function in`../utils`.
   */
  useEffect(() => {
    if(localStorage.getItem('did')) {
      handleLogin()
    }
  }, [ ])

  const renderItem = (key, index) => {
    return (<div key={key} className={styles.item}>
        <div className={styles.itemauthor}>{blessings[index].author}</div>
        <div className={styles.itembless}>Blessed</div>
        <div className={styles.itemto}>{blessings[index].to}</div>
        <hr />
        <div className={styles.itemtext}>{blessings[index].text}</div>
      </div>);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>bless.club</title>
        <meta name="description" content="Bless people you meet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image
              src={blessClubLogo}
              width="40"
              height="40"
            />
          </div>
          <span className={styles.title}>bless.club</span>
        </div>
        <ReactList
          itemRenderer={renderItem}
          length={blessings.length}
          // type='uniform'
        />
        <button onClick={() => {
          getBlessings();
        }}>
          Load more!
        </button>
      </main>
      <footer className={styles.footer}>
        {blessing === undefined && ceramic.did === undefined ? (
          <button
            onClick={() => {
              handleLogin();
            }}
          >
            Connect
          </button>
        ) : (
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label>Who?</label>
              <input
                type="text"
                placeholder="ENS name or address"
                onChange={(e) => {
                  // @ts-ignore
                  setBlessing({ ...blessing, to: e.target.value });
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Blessing</label>
              <textarea
                placeholder="Why are you blessing this person?"
                onChange={(e) => {
                  // @ts-ignore
                  setBlessing({ ...blessing, text: e.target.value });
                }}
              />
            </div>
            <div className={styles.buttonContainer}>
              <button
              onClick={() => {
                createBlessing();
              }}>
                {loading ? 'Blessing...' : 'Bless'}
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

export default Home
