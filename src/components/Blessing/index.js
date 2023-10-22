import { useEnsName } from 'wagmi'
import styles from "./Blessing.module.scss";

const toExplorerLink = (address) => `https://etherscan.io/address/${address}`
const formatAddress = (address) => `${address.slice(0, 8)}...${address.slice(-8)}`

const Blessing = ({ blessing: { cursor, node } }) => {
  const authorAddr = node.author.id.split(':')[4]
  const toAddr = node.to.id.split(':')[4]

  const { data: author, isErrorA, isLoadingA } = useEnsName({ address: authorAddr })
  const { data: to, isErrorT, isLoadingT } = useEnsName({ address: toAddr  })

  return (
    <div className={styles.blessingContainer}>
      <div className={styles.attribution}>
        <div className={styles.attributionItem}>
          <a href={toExplorerLink(authorAddr)} target="_blank">{author || formatAddress(authorAddr)}</a>
        </div>
        <div className={styles.attributionItem}>
          <i>blessed</i>
        </div>
        <div className={styles.attributionItem}>
          <a href={toExplorerLink(toAddr)} target="_blank">{to || formatAddress(toAddr)}</a>
        </div>
      </div>
      {node.text}
    </div>
  )
};

export default Blessing;
