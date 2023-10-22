import Head from "next/head";

import Header from "@components/Header";

import styles from "./Layout.module.scss";

const Layout = ({ children, className, newMarker, setNewMarker, tags, setTags, ...rest }) => {
  return (
    <div className={styles.layout}>
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
          integrity='sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM'
          crossorigin='anonymous'
        />
      </Head>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
