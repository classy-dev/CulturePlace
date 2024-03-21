import AdminLayout from "@components/layouts/Admin/layout";
import { IndexTable, WrapIndexContent } from "../product/styles";
import { useSession } from "next-auth/client";
import { useAdminPayment } from "@src/hooks/api/usePayments";
import axios from "axios";
import { css } from "@emotion/react";
import dayjs from "dayjs";

function Index() {
  const [session] = useSession();
  const { status, data, error, refetch } = useAdminPayment(session?.user.role);

  const handlerCanclePayment = (
    paymentKey: string,
    productId: string,
    coachId: string,
    paymentid: string
  ) => {
    axios
      .delete(
        `/api/payment/admin?paymentkey=${paymentKey}&productId=${productId}&coachId=${coachId}&paymentid=${paymentid}`
      )
      .then(res => {
        console.log(res);
        refetch();
      });
  };

  // 결제 취소 :  https://docs.tosspayments.com/guides/apis/cancel-payment
  // const joinMember = await Product.updateOne(
  //   { _id: productId },
  //   { $push: { joinMembr: userid } },
  //   { upsert: true }
  // );
  // if (coachId) {
  //   const coachs = await Product.updateOne(
  //     {
  //       _id: productId,
  //       coach: { $elemMatch: { _id: coachId } }
  //     },
  //     {
  //       $push: {
  //         "coach.$.register": {
  //           userinfo,
  //           paymentid: result._id
  //         }
  //       }
  //     }
  //   );
  // }
  console.log("data", data);
  return (
    <AdminLayout>
      <WrapIndexContent>
        <IndexTable>
          <thead>
            <tr>
              <th scope="col">orderId</th>
              <th scope="col">
                강의명/강사/결제일
                <br />
                신청자 이름 / 이메일 / 연락처
              </th>

              <th scope="col">보기/삭제</th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              data?.map((el: any) => (
                <tr key={el._id}>
                  <td>{el?.data?.orderId}</td>
                  <td
                    style={{
                      display: "flex",
                      alignItems: "center",
                      textAlign: "left"
                    }}
                  >
                    <img
                      src={el?.productId?.imgurl}
                      style={{ marginRight: "15px" }}
                    />
                    <div>
                      {el?.productId?.title}/{el?.productId?.people}{" "}
                      {dayjs(el.data.approvedAt).format(
                        `YY.MM.DD (ddd) / HH시MM분`
                      )}
                      <br />
                      {el?.userid?.name} / {el?.userid?.email} /{" "}
                      {el?.userid?.phone}
                    </div>
                  </td>
                  <td>
                    {el?.data?.status === "DONE" ? (
                      <button
                        onClick={() =>
                          handlerCanclePayment(
                            el.data.paymentKey,
                            el.productId._id,
                            el.coachId,
                            el._id
                          )
                        }
                        css={css`
                          padding: 10px 5px;
                          border-radius: 5px;
                          background: #000;
                          color: #fff;
                        `}
                      >
                        결제취소
                      </button>
                    ) : (
                      <span>결제취소완료</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>결제 된 상품이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </IndexTable>
      </WrapIndexContent>
    </AdminLayout>
  );
}

export default Index;
