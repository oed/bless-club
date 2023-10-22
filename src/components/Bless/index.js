import styles from "./Bless.module.scss";
import { useComposeDB } from "../../hooks/useComposeDB";
import { useState, useEffect } from "react";
import { useWalletClient, usePublicClient } from 'wagmi'



const Bless = ({ blessings, setBlessings }) => {
  const { compose, isAuthenticated } = useComposeDB();
  const { data: walletClient, isError, isLoading } = useWalletClient()
  const publicClient = usePublicClient()

  const toDID = async (input) => {
    if (input.startsWith('0x')) {
      return 'did:pkh:eip155:1:' + input.toLowerCase()
    } else if (input.indexOf('.eth') !== -1) {
      const address = await publicClient.getEnsAddress({ name: input })

      if (!address) {
        throw new Error('Incorrect ENS name or address')
      }
      return 'did:pkh:eip155:1:' + address.toLowerCase()
    }
    throw new Error('Incorrect ENS name or address')
  }

  const [loading, setLoading] = useState(null)
  const [blessing, setBlessing] = useState({})
  const createBlessing = async () => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    setLoading(true);
    const to = await toDID(blessing?.to)
    const text = blessing?.text
    const update = await compose.executeQuery(`
      mutation {
        createBlessing(input: {
          content: {
            to: "${to}"
            text: "${text}"
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
    setBlessings([{
      node: {
        to: { id: to },
        text: text,
        author: { id: compose.did.parent }
      }
    }, ...blessings])
    setBlessing({})
      // @ts-ignore
    document.getElementById('ensInput').value = ''
      // @ts-ignore
    document.getElementById('textInput').value = ''
    setLoading(false);
  }

  return (
    <> {Boolean(walletClient) && 
      <div className={styles.blessContainer}>
        <div className={styles.blessText}>
          <textarea
            id="textInput"
            placeholder="Blessing: Why are you blessing this person?"
            onChange={(e) => {
              // @ts-ignore
              setBlessing({ ...blessing, text: e.target.value });
            }}
          />
        </div>
        <div className={styles.blessExtra}>
          <input
            id="ensInput"
            type="text"
            placeholder="ENS name or address"
            onChange={(e) => {
              // @ts-ignore
              setBlessing({ ...blessing, to: e.target.value });
            }}
          />
          <button
            disabled={loading}
            onClick={() => {
              createBlessing();
            }}>
              {loading ? 'Blessing...' : 'Bless'}
          </button>
        </div>
      </div>
    } </>
  )
};

export default Bless;
