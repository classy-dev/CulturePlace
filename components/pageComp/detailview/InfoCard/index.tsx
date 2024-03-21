import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import Button from "../../../elements/Button";
import FavoriteButton from "./FavoriteButton";
import { IProduct } from "@src/typings/db";
import { InfoCard, MobileLinkArea, WrapInfoCard } from "./style";
import { Share } from "@emotion-icons/octicons/Share";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useScript } from "@src/hooks/useScriptHooks";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import _ from "lodash";

dayjs.locale("ko");

interface InfoCard {
  data: IProduct;
  _id: string;
  session: Session | null;
  community?: boolean;
}

// 제목과 버튼을 감싸는 컨테이너
const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 버튼을 배치시키는 컨테이너
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 48px);
  grid-column-gap: 15px;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

// emotionjs을 적용한 버튼 컴포넌트 추가
const URLShareButton = styled.button`
  width: 48px;
  height: 48px;
  color: white;
  border-radius: 24px;
  border: 0px;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  background-color: #7362ff;
  &:hover {
    background-color: #a99fee;
  }
`;

const KakaoShareButton = styled.a`
  cursor: pointer;
`;

const KakaoIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 24px;
`;

function Index({ data, _id, session, community }: InfoCard) {
  const {
    imgurl,
    title,
    location,
    meetday,
    people,
    firstmeet,
    saleprice,
    price,
    isvod,
    maxlimit,
    joinMembr,
    genre,
    meettype
  } = data;

  const todayCoach = dayjs().format("YYYYMMDD");

  const router = useRouter();
  const currentUrl = window.location.href;
  // 정가
  const priceNumber = useMemo(
    () => price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    [price]
  );

  // 할인가
  const salePriceNumber = useMemo(
    () => saleprice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    [saleprice]
  );

  // 할부
  const highPrice = useMemo(
    () => (saleprice / 5).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    [saleprice]
  );

  const firstMeetDay = dayjs(firstmeet);
  const startTime = useMemo(
    () => firstMeetDay.format(`MM/DD(${firstMeetDay.format("ddd")}) HH:mm`),
    [firstMeetDay]
  );

  let today = new Date();

  const linkPay = (_id: string) => {
    if (session === null) {
      alert("로그인 후 결제 가능합니다.");
      return;
    }
    router.push(`/payment/${_id}`);
  };

  console.log("infocar내의 DATA", data);

  // kakao SDK import하기
  const status = useScript("https://developers.kakao.com/sdk/js/kakao.js");

  // kakao sdk 초기화하기
  // status가 변경될 때마다 실행되며, status가 ready일 때 초기화를 시도합니다.
  useEffect(() => {
    if (status === "ready" && (window as any).Kakao) {
      // 중복 initialization 방지
      if (!(window as any).Kakao.isInitialized()) {
        // 두번째 step 에서 가져온 javascript key 를 이용하여 initialize
        (window as any).Kakao.init("967daa9071d625a392839b62f3607be7");
      }
    }
  }, [status]);

  const handleKakaoButton = () => {
    (window as any).Kakao.Link.sendScrap({
      requestUrl: currentUrl
    });
  };

  const [showSharePop, setShowSharePop] = useState(false);
  const [selectValue, setSelectValue] = useState("sel");

  const linkPayCoach = (_id: string, coachId: string) => {
    if (session === null) {
      alert("로그인 후 결제 가능합니다.");
      return;
    }
    router.push(`/payment/${_id}?coachId=${coachId}`);
  };

  return (
    <>
      <WrapInfoCard>
        {data && data?.genre !== "이벤트" ? (
          <InfoCard>
            <section className="info">
              <div className="imgarea">
                <MobileLinkArea>
                  <button
                    className="link_back"
                    type="button"
                    onClick={() => router.back()}
                  >
                    <span className="hiddenZoneV">뒤로 가기</span>
                  </button>
                  <Link href="/">
                    <a className="link_home"></a>
                  </Link>
                </MobileLinkArea>
                <img src={imgurl} width="100%" alt="" />
              </div>
              <div className="txtbox">
                <div
                  css={css`
                    position: relative;
                    display: flex;
                    align-items: center;

                    .share {
                      width: 27px;
                      height: 27px;
                      margin-top: 7px;
                      margin-left: 20px;
                    }
                  `}
                >
                  <h2>{title}</h2>
                  <Share
                    className="share"
                    onClick={() => setShowSharePop(true)}
                  />
                </div>
                <div className="meetInfo">
                  <div>
                    {location && <span>{location} |</span>}{" "}
                    <span>{meetday}</span>
                  </div>
                  {meettype === "one" && (
                    <div>
                      <span>시작일자 : </span> <span>{startTime}</span>
                    </div>
                  )}
                </div>
                <div className="comment">#{people}</div>

                {data.coach?.length !== 0 && (
                  <div>
                    <select
                      css={css`
                        width: 100%;
                        font-size: 13px;
                        padding: 5px;
                        margin-top: 15px;
                        border: 1px solid #dcdcdc;

                        option {
                          font-size: 14px;
                          &:disabled {
                            background: gray;
                            color: #fff;
                          }
                        }
                      `}
                      value={selectValue}
                      onChange={e => setSelectValue(e.target.value)}
                    >
                      <option value="sel">날짜를 선택해주세요.</option>
                      {_.sortBy(data?.coach, "startTime").map(
                        (el, i) =>
                          dayjs(el.startTime).format("YYYYMMDD") >
                            todayCoach && (
                            <option
                              key={el._id}
                              value={el._id}
                              disabled={
                                el.register.length >= el.maxLimit ? true : false
                              }
                            >
                              {dayjs(el.startTime).format(`MM.DD (ddd) HH:MM`)}{" "}
                              ~ {dayjs(el.endTime).format(` HH:MM`)} ::{" "}
                              {el.register.length >= el.maxLimit
                                ? "인원마감되었습니다."
                                : `${el.maxLimit}명 / ${el.price} 원`}
                            </option>
                          )
                      )}
                    </select>
                  </div>
                )}

                <div className="wrap_price">
                  {meettype === "one" && (
                    <span
                      className={`price  ${saleprice !== 0 ? "issale" : ""}`}
                    >
                      {" "}
                      <span className="txt">정가</span>
                      {priceNumber}원
                    </span>
                  )}

                  {saleprice !== 0 && (
                    <>
                      {" "}
                      |
                      <span className="price">
                        <span className="txt">현재 판매가</span>
                        {salePriceNumber}원
                      </span>
                    </>
                  )}
                </div>

                {saleprice !== 0 && price > 10 && (
                  <div className="wrap_price wrap_price2">
                    <span className="price">
                      <span className="txt">5개월 무이자 할부 시 </span>월{" "}
                      {highPrice}원
                    </span>
                  </div>
                )}
              </div>
            </section>

            <div className="box_btn">
              <FavoriteButton _id={_id} data={data} />
              {/* 코칭일때 */}
              {data.coach?.length !== 0 && (
                <Button
                  color="brand"
                  size="l"
                  onClick={() => linkPayCoach(_id, selectValue)}
                >
                  나를 위한 경험, 지금 시작
                </Button>
              )}
              {/* 코칭이 아닐때 */}
              {!isvod && maxlimit > joinMembr.length && (
                <Button color="brand" size="l" onClick={() => linkPay(_id)}>
                  나를 위한 경험, 지금 시작
                </Button>
              )}
              {data && isvod && maxlimit > joinMembr.length && (
                <>
                  {data?.joinMembr?.some(
                    (user: any) => user._id === String(session?.user?.uid)
                  ) ? (
                    <Button
                      color="brand2"
                      size="l"
                      onClick={() => router.push(`/vod/${_id}`)}
                    >
                      VOD 강의실로 이동
                    </Button>
                  ) : (
                    <Button color="brand" size="l" onClick={() => linkPay(_id)}>
                      나를 위한 경험, 지금 시작
                    </Button>
                  )}
                </>
              )}
              {joinMembr.length >= maxlimit && meettype === "one" && (
                <Button color="gray" disable size="l">
                  마감되었습니다.
                </Button>
              )}
              {community ? (
                <Button
                  color="black"
                  size="m"
                  onClick={() => router.push(`/detailview/${_id}`)}
                >
                  소개
                </Button>
              ) : (
                <Button
                  color="pastelGreen"
                  size="m"
                  onClick={() => router.push(`/community/${_id}`)}
                >
                  커뮤니티
                </Button>
              )}
            </div>
          </InfoCard>
        ) : (
          <InfoCard className="event">
            {data && (
              <>
                <h2>{title}</h2>
                <img src={imgurl} width="100%" alt="" />
                <div className="meetInfo">
                  <div>
                    <span className="tit">일시:</span> <span>{startTime}</span>
                  </div>
                  <div>
                    <span className="tit">장소:</span> <span>{location}</span>
                  </div>
                </div>
                <div className="price">멤버 {price}원</div>
                {dayjs(firstmeet) > dayjs(today) ? (
                  <Button color="brand" size="s">
                    신청하기
                  </Button>
                ) : (
                  <Button color="event" size="s" outline>
                    이 이벤트는 종료 되었습니다.
                  </Button>
                )}
              </>
            )}
          </InfoCard>
        )}
      </WrapInfoCard>
      {showSharePop && (
        <>
          <div
            css={css`
              position: fixed;
              z-index: 1500;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.7);
            `}
          />
          <div
            css={css`
              position: fixed;
              z-index: 1500;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 300px;
              border: 1px solid;
              border-radius: 5px;
              background: #fff;
            `}
          >
            <header
              css={css`
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px 18px;
                align-items: center;
                font-weight: bold;
                border-bottom: 1px solid rgb(238, 238, 238);
              `}
            >
              <span>공유하기</span>
              <button
                css={css`
                  display: block;
                  font-size: 20px;
                  cursor: pointer;
                `}
                onClick={() => setShowSharePop(false)}
              >
                x
              </button>
            </header>
            <FlexContainer>
              <GridContainer>
                <KakaoShareButton onClick={handleKakaoButton}>
                  <KakaoIcon src="/images/ico_kakao.svg"></KakaoIcon>
                  <div
                    css={css`
                      margin-top: 5px;
                      font-size: 12px;
                      text-align: center;
                    `}
                  >
                    카카오
                  </div>
                </KakaoShareButton>
                <FacebookShareButton url={currentUrl}>
                  <FacebookIcon
                    size={48}
                    round={true}
                    borderRadius={24}
                    css={css`
                      display: block;
                    `}
                  ></FacebookIcon>
                  <div
                    css={css`
                      margin-top: 5px;
                      font-size: 12px;
                      text-align: center;
                    `}
                  >
                    페이스북
                  </div>
                </FacebookShareButton>
                <TwitterShareButton url={currentUrl}>
                  <TwitterIcon
                    size={48}
                    round={true}
                    borderRadius={24}
                    css={css`
                      display: block;
                    `}
                  ></TwitterIcon>
                  <div
                    css={css`
                      margin-top: 5px;
                      font-size: 12px;
                      text-align: center;
                    `}
                  >
                    트위터
                  </div>
                </TwitterShareButton>
                <div>
                  <CopyToClipboard text={currentUrl}>
                    <URLShareButton>URL</URLShareButton>
                  </CopyToClipboard>
                  <div
                    css={css`
                      margin-top: 5px;
                      font-size: 12px;
                      text-align: center;
                    `}
                  >
                    링크복사
                  </div>
                </div>
              </GridContainer>
            </FlexContainer>
          </div>
        </>
      )}
    </>
  );
}

export default Index;
