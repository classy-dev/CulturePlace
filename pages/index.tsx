import { GetServerSideProps } from "next";
import { dbConnect, Product, Notice } from "../pages/api";
import { dehydrate, QueryClient } from "react-query";
import { useProductsMain } from "@src/hooks/api/useProducts/useProductsMain";
import { IndexSeo } from "@components/elements/CommonSeo";
import Layout from "@components/layouts";
import Morebtn from "@components/pageComp/indexpage/Morebtn";
import {
  MainVisual,
  WrapIndex,
  CategoryMenu,
  CardSlideArea,
  BlogArea,
  NoticeArea
} from "@components/pageComp/indexpage";
import { ISSR } from "@src/typings/db";
import Title from "@components/elements/Title";
import { css } from "@emotion/react";
import { mq } from "@components/mq";
import { useSession } from "next-auth/client";

const Home = ({ SsrData }: ISSR) => {
  const { blogData, noticeData, products } = SsrData;

  const { data } = useProductsMain(products);
  const productsData = data?.products;

  const genreTitle1 = [
    { title: "미술을 즐기자", url: "/view/art" },

    {
      title: "스트레스여 안녕~ 신나게 춤추자",
      url: "/view/dance"
    },
    {
      title: "피아노, 기타, 우크렐라.. 그리고",
      url: "/view/music"
    }
  ];

  const genreTitle2 = [
    { title: "우리만의 연극, 뮤지컬을 만들자", url: "/view/theater" },
    { title: "함께 맛있게 먹어요", url: "/view/food" },
    // {
    //   title: "사진, 영상, 영화의 세계",
    //   url: "/view/movie"
    // },
    { title: "나를 발전시키는 컬쳐", url: "/view/wisdom" },
    { title: "힐링모임", url: "/view/healing" }
  ];

  function getGenreData1() {
    if (Array.isArray(productsData)) {
      return [
        productsData.filter(el => el.genre === "art"),
        productsData.filter(el => el.genre === "dance"),
        productsData.filter(el => el.genre === "music")
      ];
    }
  }

  function getGenreData2() {
    if (Array.isArray(productsData)) {
      return [
        productsData.filter(el => el.genre === "theater"),
        productsData.filter(el => el.genre === "food"),
        // productsData.filter(el => el.genre === "movie"),
        productsData.filter(el => el.genre === "wisdom"),
        productsData.filter(el => el.genre === "healing")
      ];
    }
  }

  const genreData1 = getGenreData1();
  const genreData2 = getGenreData2();

  const [session] = useSession();

  console.log("session session", session);

  return (
    <Layout>
      <IndexSeo />
      <MainVisual />
      <WrapIndex>
        <CategoryMenu />
        <CardSlideArea genreData={genreData1} genreTitle={genreTitle1} />
        <Title>진행 중인 인기 이벤트</Title>
        <div
          css={css`
            display: flex;
            ${mq[0]} {
              display: block;
              padding: 0 20px;
              > div {
                margin-bottom: 15px;
              }
            }
          `}
        >
          <div>
            <img
              src="/images/bnr_event1.png"
              alt="김미리 작가의 북콘서트에 초대합니다."
            />
          </div>
          <div
            css={css`
              margin-left: auto;
            `}
          >
            <img src="/images/bnr_event2.png" alt="가을 여행" />
          </div>
        </div>
        <CardSlideArea genreData={genreData2} genreTitle={genreTitle2} />
        <Morebtn />
        <BlogArea blogData={blogData} />
        <NoticeArea noticeData={noticeData} />
      </WrapIndex>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();
  await dbConnect();

  const [result, result2, result3] = await Promise.all([
    Notice.find(
      { category: "블로그" },
      { body: false, createdAt: false, updatedAt: false }
    )
      .limit(3)
      .lean(),
    Notice.find(
      { category: "공지사항" },
      { body: false, createdAt: false, updatedAt: false }
    )
      .limit(4)
      .lean(),
    Product.find(
      { isvod: { $ne: true }, islive: { $ne: false } },
      { body: false }
    )
      .sort({ firstmeet: 1 })
      .limit(90)
      .lean()
  ]);

  const SsrData = {
    blogData: JSON.parse(JSON.stringify(result)),
    noticeData: JSON.parse(JSON.stringify(result2)),
    products: JSON.parse(JSON.stringify(result3))
  };

  await queryClient.prefetchQuery(["list", "main"], () => SsrData);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      SsrData
    }
  };
};

export default Home;
