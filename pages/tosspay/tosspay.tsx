import { loadTossPayments } from "@tosspayments/sdk";
import React from "react";

function Tosspay() {
  const [name, setName] = React.useState("설레임");
  const clientKey = "test_ck_5GePWvyJnrKODy7KB17rgLzN97Eo";

  const tossPay = () => {
    //orderId가 필요해서 만든 랜덤 아이디값
    const random = new Date().getTime() + Math.random();
    const randomId = btoa(String(random));
    loadTossPayments(clientKey).then(tossPayments => {
      // 카드 결제 메서드 실행
      tossPayments.requestPayment(`카드`, {
        amount: 100, // 가격
        orderId: `${randomId}`, // 주문 id
        orderName: `gagyeong`, // 결제 이름
        customerName: `설레임`, // 판매자, 판매처 이름
        successUrl: "https://cultureplace.seolleim.kr/tosspay/success", // 성공시 리다이렉트 주소
        failUrl: "https://cultureplace.seolleim.kr/tosspay/failed" // 실패시 리다이렉트 주소
      });
    });
  };

  return (
    <div>
      tosspay <button onClick={tossPay}>결제</button>
    </div>
  );
}

export default Tosspay;
