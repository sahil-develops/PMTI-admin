import React from 'react'
import Blogs from '../components/Blog/Blogs'
import Head from 'next/head';
const page = () => {
  return (
    <div>
        <Head>
            <title>Blog | PMTI Dashboard</title>
        </Head>
        <Blogs/>
    </div>
  )
}

export default page