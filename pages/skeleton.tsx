import { useEffect, useState } from "react";
import Skeleton from "@components/elements/Skeleton";
import styled from "@emotion/styled";

const Base = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(5, 1fr);
  column-gap: 12px;
  row-gap: 24px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: rgb(0 0 0 / 4%) 0px 4px 16px 0px;
  border-radius: 4px;
`;

const ImageWrapper = styled.div`
  width: 100%;
`;

const ImageItem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Info = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
`;

const Title = styled.h4`
  margin: 0;
  padding: 0;
  font-size: 24px;
`;

const Description = styled.p`
  margin: 8px 0 0 0;
  padding: 0;
  font-size: 16px;
`;

const Placeholder: React.FC = () => (
  // <Item /> 에 대응하는 Placeholder 제작
  <Container>
    <ImageWrapper>
      <Skeleton width={"320px"} height={"220px"} />
    </ImageWrapper>
    <Info>
      <Skeleton width={"150px"} height={"29px"} rounded />
      <div style={{ height: "8px" }} />
      <Skeleton width={"200px"} height={"19px"} rounded />
    </Info>
  </Container>
);

const Item: React.FC = () => (
  // 실제 보여줄 컨텐츠
  <Container>
    <ImageWrapper>
      <ImageItem src="https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/cat_relaxing_on_patio_other/1800x1200_cat_relaxing_on_patio_other.jpg" />
    </ImageWrapper>
    <Info>
      <Title>Cat taking a nap</Title>
      <Description>zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz</Description>
    </Info>
  </Container>
);

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 임의로 로딩 상태 표현
    const skeletonAni = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(skeletonAni);
  }, []);

  return (
    <Base>
      {loading
        ? Array.from({ length: 25 }).map((_, idx) => <Placeholder key={idx} />)
        : Array.from({ length: 25 }).map((_, idx) => <Item key={idx} />)}
    </Base>
  );
}

export default App;
