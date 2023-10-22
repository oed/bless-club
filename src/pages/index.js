import Head from "next/head";
import { useState, useEffect } from "react";

import Layout from "@components/Layout";
import Section from "@components/Section";
import Container from "@components/Container";
import Blessing from "@components/Blessing";
import Bless from "@components/Bless";

import styles from "@styles/Home.module.scss";

import { useComposeDB } from "../hooks/useComposeDB";

const DESCRIPTION =
  "Bless club is the app where prophets go to share their blessings.";

export default function Home() {
  const { compose, isAuthenticated } = useComposeDB();

  const [blessings, setBlessings] = useState([]);
  const [cursor, setCursor] = useState(null);
  async function loadBlessings() {
    const { data: { blessingIndex: { 
      pageInfo: { hasPreviousPage },
      edges: rawBlessings
    }}} = await compose.executeQuery(`
      query{
        blessingIndex(last:100${cursor ? `, before: "${cursor}"` : ''}){
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
    `)
    if (rawBlessings) {
      setBlessings(rawBlessings.reverse())
    } else {
      setBlessings([])
    }
  }


  useEffect(() => {
    loadBlessings()
  }, [])



  return (
    <Layout>
      <Head>
        <title>Bless Club</title>
        <meta name='description' content={DESCRIPTION} />
        <link rel='icon' href='/favicon.ico' />
        <meta property="og:title" content="bless.club" />
        <meta property="og:url" content="https://bless.club" />
        <meta
          property="og:image"
          content="/logo.png"
        />
      </Head>

      <Section>
        <Container>
          <Bless blessings={blessings} setBlessings={setBlessings} />
          {
            blessings.map((blessing) => (
              <Blessing key={blessing.cursor} blessing={blessing} />
            ))
          }
        </Container>
      </Section>
    </Layout>
  );
}

