import { Dispatch, SetStateAction } from "react";
import { useProdDetail } from "@src/hooks/api/useProducts/useProductDetail";
import { IProduct } from "@src/typings/db";
import { css } from "@emotion/react";
import { MeetInfoLayer } from "./styles";
import dayjs from "dayjs";
import _ from "lodash";

interface IShowMemInfo {
  show: boolean;
  _id: string;
}

interface IJoinMembr {
  name: string;
  email: string;
  phone: string;
}

interface IMeetInfo {
  showMemInfo: IShowMemInfo;
  setshowMemInfo: Dispatch<SetStateAction<IShowMemInfo>>;
  products: IProduct[] | undefined;
}

function MeetInfo({ showMemInfo, setshowMemInfo, products }: IMeetInfo) {
  // 게시물 리스트 가져오기
  const { status, data, error, refetch } = useProdDetail(showMemInfo._id);
  const meetInfoData = data as any;

  return (
    <MeetInfoLayer>
      <span
        className="btn_close"
        onClick={e => {
          e.stopPropagation();
          setshowMemInfo({ show: false, _id: "" });
        }}
      >
        x
      </span>
      <h2>Join Member</h2>
      <div className="memberArea">
        <h2>모임리더</h2>
        <div
          className="creator"
          css={css`
            overflow: auto;
            max-height: 200px;
            margin: 0 0 10px;
            span {
              margin-right: 10px;
            }
          `}
        >
          <span>{meetInfoData?.creator.name}</span>
          <span>{meetInfoData?.creator.email}</span>
          <span>{meetInfoData?.creator.phone}</span>
        </div>
        <h2
          css={css`
            margin-top: 20px;
          `}
        >
          신청하신 분(결제완료)
        </h2>
        {data?.coach?.length === 0 ? (
          <table>
            <tbody>
              {meetInfoData?.joinMembr?.map((el: IJoinMembr, i: number) => (
                <tr key={i}>
                  <td>{el.name}</td>
                  <td>{el.email}</td>
                  <td>{el.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>
            {_.sortBy(data?.coach, "startTime").map(el => (
              <div key={el._id}>
                <div
                  css={css`
                    margin-top: 15px;
                    border-bottom: 1px solid #ccc;
                  `}
                >
                  {`${dayjs(el.startTime).format(
                    "YY.MM.DD (ddd) / HH:MM"
                  )} ~ ${dayjs(el.endTime).format(" HH:MM")}`}
                </div>
                <div>
                  <table>
                    <tbody>
                      {el.register.map((member, i) => (
                        <tr key={i}>
                          <td>{member.userinfo.name}</td>
                          <td>{member.userinfo.email}</td>
                          <td>{member.userinfo.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MeetInfoLayer>
  );
}

export default MeetInfo;
