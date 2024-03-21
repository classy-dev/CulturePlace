import { useMemo } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { dbConnect, Notice } from "../../pages/api";
import { useRouter } from "next/router";
import { dehydrate, QueryClient } from "react-query";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import Button from "@components/elements/Button";
import Layout from "@components/layouts";
import { useNotice } from "@src/hooks/api/useNotices/useNotice";
import {
  CreateAt,
  NoticeButton,
  NoticeView,
  Title
} from "@components/pageComp/notice/styles";

function DetailView() {
  const router = useRouter();
  const { _id } = router.query;
  const { status, data, error, isFetching } = useNotice(String(_id));

  const createTime = useMemo(
    () => dayjs(data?.updatedAt).format("YYYY.MM.DD"),
    [data?.updatedAt]
  );

  console.log(data);

  return (
    <Layout>
      <NoticeView>
        {data && (
          <>
            <div className="top" onClick={() => router.back()}>
              <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon>
              목록
            </div>
            <Title>{data?.title}</Title>
            <CreateAt>{createTime}</CreateAt>
            <img src={data?.imgurl} alt={data?.title} />
            <div dangerouslySetInnerHTML={{ __html: String(data?.body) }} />
            <Button
              color="brand"
              size="s"
              css={NoticeButton}
              onClick={() => router.back()}
            >
              목록으로
            </Button>
          </>
        )}
      </NoticeView>
    </Layout>
  );
}
export const getStaticPaths: GetStaticPaths = async () => {
  await dbConnect();

  const result = await Notice.find({}, { _id: 1 }).lean();
  const paths = result.map(item => ({
    params: { _id: item._id.toString() }
  }));

  return {
    paths,
    fallback: true
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  await dbConnect();

  const _id = ctx.params?._id;
  const result = await Notice.find(
    { _id },
    { createdAt: false, updatedAt: false }
  ).lean();

  if (!result.length) {
    return {
      notFound: true
    };
  }

  const data = JSON.parse(JSON.stringify(result[0]));

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["noticeViewData", _id], () => data);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      item: data
    }
  };
};

export default DetailView;
