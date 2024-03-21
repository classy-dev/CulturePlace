import { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

function Success() {
  const router = useRouter();
  const { orderId, paymentKey, amount } = router.query;

  useEffect(() => {
    console.log(
      "orderId, paymentKey, amount, router.isReady",
      orderId,
      paymentKey,
      amount,
      router.isReady
    );
    router.isReady &&
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

          //router.push("/");
          console.log(res);
        })
        .catch(err => {
          console.log(err);
          router.push("/tosspay/fail");
        });
  }, [router.isReady]);

  return <div>결제승인중</div>;
}

export default Success;
