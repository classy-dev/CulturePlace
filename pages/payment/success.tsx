import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import PaymentComplete from "@components/pageComp/payment/PaymentComplete";
import Layout from "@components/layouts";
import { session, useSession } from "next-auth/client";
import { PaymentSeo } from "@components/elements/CommonSeo";

function Success() {
  const router = useRouter();
  const { productId, coachId, orderId, paymentKey, amount } = router.query;
  const [session] = useSession();

  const [completeData, setcompleteData] = useState<any>({
    data: { item_name: "", order_id: "", payment_data: "" }
  });
  const [payComplete, setpayComplete] = useState(false);

  useEffect(() => {
    // console.log(
    //   "orderId, paymentKey, amount, router.isReady, session?.user.uid, productId, coachId",
    //   orderId,
    //   paymentKey,
    //   amount,
    //   router.isReady,
    //   session?.user.uid,
    //   productId,
    //   coachId
    // );
    console.log(session?.user);
    router.isReady &&
      session?.user.uid &&
      axios
        .get(
          `/api/tosspay?paymentKey=${paymentKey}&amount=${amount}&orderId=${orderId}`
        )
        .then(res => {
          // window.alert({
          //   position: "center",
          //   icon: "success",
          //   text: "결제가 완료되었습니다!",
          //   showConfirmButton: false,
          //   timer: 1500
          // });
          console.log("res", res, "res.data", res.data);
          //router.push("/");
          const variables = {
            data: res.data,
            userinfo: session?.user,
            userid: session?.user.uid,
            productId,
            coachId: coachId ? coachId : null
          };
          setcompleteData(variables);
          setpayComplete(true);

          //결제정보 저장
          axios.post("/api/payment", variables);
          // 결제한 사용자 정보저장
          // axios.put("/api/payment", {
          //   _id: productId,
          //   userid: session?.user.uid
          // });
        })
        .catch(err => {
          console.log(err);
          router.push("/payment/fail");
        });
  }, [router.isReady, session?.user.uid]);

  return payComplete ? (
    <>
      <PaymentSeo />
      <PaymentComplete completeData={completeData} />
    </>
  ) : (
    <>
      <PaymentSeo />
      <Layout>결제승인중</Layout>
    </>
  );
}

export default Success;
