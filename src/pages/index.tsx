import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/Link';
import {BiUser} from 'react-icons/bi';
import {AiOutlineCalendar} from 'react-icons/ai';
import Prismic from '@prismicio/client'
import React, { useState } from 'react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';
interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // console.log('postsPagination',postsPagination.next_page)

  const PostsFormatted = postsPagination.results.map(post => {
    return{
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale:ptBR,
        }
      ),
    }

  })

  const [posts,setPosts] = useState<Post[]>(PostsFormatted);
  const [nextPage,setNextPage] = useState(postsPagination.next_page);
  const [nextPageExists,setNextPageExists] = useState(1)

  async function handleNextPage() {
    if(nextPageExists !== 1 && nextPage === null){
      return;
    }
    const postsResult = await fetch(`${nextPage}`).then(response =>
      response.json()
    );
    setNextPage(postsResult.next_page);
    setNextPageExists(postsResult.page);


    const loadNewPosts = postsResult.results.map(post=> {
      return {
        uid:post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd MMM yyyy",
          {
            locale:ptBR,
          }
        ),
        data:{
          title:post.data.title,
          subtitle:post.data.subtitle,
          author:post.data.author
        }
      }
    })
    setPosts([...posts,...loadNewPosts]);
  }

  return(
    <div className={commonStyles.container}>
    <Header />
    {posts.map(post => (
      <Link key={post.uid} href={`/post/${post.uid}`}>
        <a className={styles.post}>
          <strong>{post.data.title}</strong>
          <p>{post.data.subtitle}</p>
          <div className={styles.containerSmall}>
            <time><AiOutlineCalendar />{post.first_publication_date}</time>
            <small><BiUser/>{post.data.author}</small>
          </div>
        </a>
      </Link>
    ))}
    {postsPagination.next_page !== null && (

      <button type="button" className={styles.loadMore} onClick={handleNextPage}>Carregar mais posts</button>

    )}
  </div>
  )

}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at("document.type","posts",)],
    {
      pageSize:4,
    }
    );

    const posts = postsResponse.results.map(posts => {
      return {
        uid: posts.uid,
        first_publication_date: posts.first_publication_date,
        data: {
          title: posts.data.title,
          subtitle: posts.data.subtitle,
          author:posts.data.author,
        }
      }
    })
    const postsPagination = {
      next_page:postsResponse.next_page,
      results:posts,
    }

    return {
      props:{
        postsPagination,
      }
    }


};