import { useState, useEffect } from "react";
import { useComposeDB } from "../../hooks/useComposeDB";
import { useEnsName } from "wagmi";
import Link from "next/link";

import styles from "./Leaderboard.module.css";

function Leader({ author, count }) {
  const { data: ensName, isError, isLoading } = useEnsName({ address: author.split(":")[4] });

  if (isError) {
    console.error("Error fetching ENS name for", author, ":", isError);
  }

  if (isLoading) {
    console.log("Loading ENS name for", author, "...");
  }

  function formatAddress(address) {
    return address.split(":")[4];
    // return `${stripped.slice(0, 6)}...${stripped.slice(-4)}`;
  }

  return (
    <li>
      <strong>
        [{count} pin{count > 1 && "s"}]
      </strong>
      &nbsp;-&nbsp;
      <Link href={`https://etherscan.io/address/${formatAddress(author)}`}>
        <span className={styles.walletAddress}>
          {ensName || `${formatAddress(author).slice(0, 6)}...${formatAddress(author).slice(-4)}`}
        </span>
      </Link>
    </li>
  );
}

export default function Leaderboard() {
  const { compose } = useComposeDB();
  const [leaders, setLeaders] = useState([]);

  async function loadLeaders() {
    const pins = await compose.executeQuery(`
    query {
      pinIndex(first:100) {
        edges {
          node {
            id
            author {id}
          }
        }
      }
    }`);
    console.log(pins);

    const counts = pins.data.pinIndex.edges
      .map((edge) => edge.node)
      .reduce((acc, pin) => {
        if (!(pin.author.id in acc)) {
          acc[pin.author.id] = 0;
        }
        acc[pin.author.id] += 1;
        return acc;
      }, {});

    console.log(counts);
    setLeaders(
      Object.keys(counts)
        .map((k) => ({ author: k, count: counts[k] }))
        .sort((a, b) => b.count - a.count)
    );
  }

  useEffect(() => {
    loadLeaders();
  }, []);

  return (
    <ol>
      {leaders.map((leader, index) => (
        <Leader key={leader.author} {...leader} />
      ))}
    </ol>
  );
}
