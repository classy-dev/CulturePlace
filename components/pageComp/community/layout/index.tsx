import { Session } from "next-auth";
import Layout from "@components/layouts";
import {
  DetailViewWrap,
  Content
} from "@components/pageComp/detailview/styles";
import { InfoCard } from "@components/pageComp/detailview";
import { IProduct } from "@src/typings/db";
import { CommunityInfoCard } from "@components/pageComp/detailview/InfoCard/style";
import { IndexSeo } from "@components/elements/CommonSeo";
interface ICommunityLayout {
  children: React.ReactNode;
  data: IProduct;
  _id: string;
  session: Session;
}

function CommunityLayout({ children, data, _id, session }: ICommunityLayout) {
  return (
    <Layout className="detail ">
      <IndexSeo />
      <DetailViewWrap>
        <CommunityInfoCard>
          <InfoCard
            data={data}
            _id={String(_id)}
            session={session}
            community={true}
          />
        </CommunityInfoCard>
        <Content>{children}</Content>
      </DetailViewWrap>
    </Layout>
  );
}

export default CommunityLayout;
