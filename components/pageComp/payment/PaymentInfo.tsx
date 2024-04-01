import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "@components/layouts";
import { css } from "@emotion/react";
import { IProduct } from "@src/typings/db";
import WrapPayment from "./styles";
import { loadTossPayments } from "@tosspayments/sdk";
import dayjs from "dayjs";

interface IPaymentInfo {
  data: IProduct;
  session: Session;
  coachId: string;
}

function PaymentInfo({ data, session, coachId }: IPaymentInfo) {
  const router = useRouter();
  const [coachData, setCoachData] = useState<any>();

  const clientKey = "test_ck_5GePWvyJnrKODy7KB17rgLzN97Eo";
  const [paymentInfo, setPaymentInfo] = useState({
    phone: session.user.phone,
    agree: false
  });

  const chgPaymentinfo = (
    target: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentInfo(
      target === "agree"
        ? { ...paymentInfo, [target]: !paymentInfo.agree }
        : { ...paymentInfo, [target]: e.target.value }
    );
  };

  useEffect(() => {
    setCoachData(data.coach?.filter(el => el._id === coachId));
  }, []);

  const tossPay = () => {
    //orderId가 필요해서 만든 랜덤 아이디값
    const random = new Date().getTime() + Math.random();
    const randomId = btoa(String(random));
    if (paymentInfo.phone === "" || paymentInfo.phone === undefined) {
      alert("구매자 전화번호를 입력하셔야합니다.");
      return;
    }
    if (!paymentInfo.agree) {
      alert("구매조건 확인 및 결제진행에 동의를 해주셔야 결제가 진행됩니다.");
      return;
    }

    console.log(
      "data?.title, data?.title, data?.title, data?.title",
      data?.title
    );

    const option =
      coachData && coachData.length > 0
        ? {
            amount: coachData[0]?.price, // 가격
            orderId: `${randomId}`, // 주문 id
            orderName: `${data?.title}  ${dayjs(coachData[0]?.startTime).format(
              `YY.MM.DD (ddd)`
            )}`, // 결제 이름
            customerName: `컬쳐플레이스`, // 판매자, 판매처 이름
            successUrl: `https://cultureplace.seolleim.kr/payment/success?productId=${data._id}&coachId=${coachId}`, // 성공시 리다이렉트 주소
            failUrl: "https://cultureplace.seolleim.kr/payment/failed" // 실패시 리다이렉트 주소
          }
        : {
            amount: data?.saleprice ? data?.saleprice : data?.price, // 가격
            orderId: `${randomId}`, // 주문 id
            orderName: data?.title, // 결제 이름
            customerName: `컬쳐플레이스`, // 판매자, 판매처 이름
            successUrl: `https://cultureplace.seolleim.kr/payment/success?productId=${data._id}`, // 성공시 리다이렉트 주소
            failUrl: "https://cultureplace.seolleim.kr/payment/failed" // 실패시 리다이렉트 주소
          };

    loadTossPayments(clientKey).then(tossPayments => {
      // 카드 결제 메서드 실행
      tossPayments.requestPayment(`카드`, option);
    });
  };

  return (
    <Layout>
      <WrapPayment>
        <h2>결제</h2>
        <div className="wrap_box_area">
          <div className="info">
            <div className="box box_product">
              <h3>주문 상품 정보</h3>
              <div className="cont">
                <div className="thumb">
                  <img src={data.imgurl} alt="" />
                </div>
                <dl>
                  <dt className="tit">
                    {data.title}

                    {coachData && coachData.length > 0 && (
                      <div>
                        {dayjs(coachData[0]?.startTime).format(
                          `YYYY.MM.DD (ddd) / HH:MM`
                        )}{" "}
                        ~ {dayjs(coachData[0]?.endTime).format(`HH:MM`)}
                      </div>
                    )}
                  </dt>
                  <dd className="price">
                    {coachData && coachData.length > 0
                      ? coachData[0]?.price
                      : data?.saleprice
                      ? data.saleprice
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : data.price
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    원
                  </dd>
                  <dd
                    css={css`
                      display: block;
                      color: #ddd;
                      text-decoration: line-through;
                    `}
                  >
                    {coachData && coachData.length > 0
                      ? coachData[0]?.price
                      : data.price
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원"}
                  </dd>
                </dl>
              </div>
            </div>
            <div>
              <div className="box box_user">
                <h3>주문자 정보</h3>
                <dl>
                  <dt>{session?.user?.name}</dt>
                  <dd>
                    <input
                      type="tel"
                      className="tel"
                      name="tel"
                      value={paymentInfo.phone}
                      onChange={e => chgPaymentinfo("phone", e)}
                      placeholder="구매자 전화번호 입력"
                    />
                  </dd>
                  <dd>{session?.user.email}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="priceInfo">
            <div className="box box_price">
              <h3>최종 결제금액</h3>
              <p>
                <span className="txt">총 결제금액</span>
                <span className="price">
                  {coachData && coachData.length > 0
                    ? coachData[0]?.price
                    : data?.saleprice
                    ? data.saleprice
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : data.price
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  원
                </span>
              </p>

              {data?.saleprice !== 0 && (
                <p
                  css={css`
                    display: block;
                    color: #ddd;
                    text-decoration: line-through;
                  `}
                >
                  <span className="txt">할인 전 가격</span>
                  <span className="price">
                    {data.price
                      ?.toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원"}
                  </span>
                </p>
              )}
            </div>
            <div className="box box_agree">
              <input
                type="checkbox"
                checked={paymentInfo.agree}
                value="chkagree"
                onChange={e => chgPaymentinfo("agree", e)}
                id="agree"
              />
              <label htmlFor="agree">구매조건 확인 및 결제진행에 동의</label>
            </div>
            <div className="btn_pay" onClick={tossPay}>
              결제하기
            </div>
          </div>
        </div>
      </WrapPayment>
    </Layout>
  );
}

export default PaymentInfo;
