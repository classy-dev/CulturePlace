import { useSession } from "next-auth/client";
import router from "next/router";
import axios from "axios";
import dayjs from "dayjs";
import purify from "dompurify";
import { prodUpStore, QuillStore } from "@src/mobx/store";
import AdminLayout from "@components/layouts/Admin/layout";
import { ConfirmView } from "@components/pageComp/creator/styles";
import { AdminBoxBtn } from "@components/modules/QuillEditor/styles";
import { css } from "@emotion/react";

function Confirm() {
  //세션 정보 가져오기
  const [session] = useSession();

  // 데이터불러오기
  if (prodUpStore.data !== null) {
    prodUpStore.data.body = QuillStore.data;
    if (
      prodUpStore.data.saleprice === "" ||
      prodUpStore.data.saleprice === null
  ) {
      prodUpStore.data.saleprice = 0;
    }
    if (!prodUpStore.data.imgurl.match(/\S*\.gif/i)) {
      prodUpStore.data.imgurl = prodUpStore.data.imgurl.replace(
        /\/cardoriginal\//,
        "/cardoriginal/"
        // "/card/"
      );
    }

    //등록
    const saveProduct = () => {
      const data = {
        ...prodUpStore?.data,
        firstmeet:
          prodUpStore?.data.firstmeet === "" ||
          prodUpStore?.data.firstmeet === "Invalid Date"
            ? null
            : prodUpStore?.data.firstmeet,
        meetday:
          prodUpStore?.data.meetday === "" ||
          prodUpStore?.data.meetday === "Invalid Date"
            ? null
            : prodUpStore?.data.meetday
      };

      axios.post("/api/product/", data).then(function (resp) {
        prodUpStore.reset();
        router.push("./");
      });
    };

    //수정
    const modifyConfrimProduct = (_id: string) => {
      const data = {
        ...prodUpStore?.data,
        firstmeet:
          prodUpStore?.data.firstmeet === "" ||
          prodUpStore?.data.firstmeet === "Invalid Date"
            ? null
            : prodUpStore?.data.firstmeet,
        meetday:
          prodUpStore?.data.meetday === "" ||
          prodUpStore?.data.meetday === "Invalid Date"
            ? null
            : prodUpStore?.data.meetday
      };

      axios.put(`/api/product/${_id}`, data).then(function (resp) {
        prodUpStore.reset();
        router.push("./");
      });
    };

    return (
      <AdminLayout genre={"creator"}>
        <>
          <ConfirmView>
            <div className="list">
              <dl>
                <dt>대표 이미지</dt>
                <dd>
                  <div
                    css={css`
                      width: 50%;
                    `}
                  >
                    <img
                      src={prodUpStore?.data.imgurl}
                      alt="모임대표이미지 등록"
                    />
                  </div>{" "}
                </dd>
                <dt>제목</dt>
                <dd>{prodUpStore?.data.title}</dd>
                <dt>등록자</dt>
                <dd>{session?.user.name}</dd>
                <dt>코치</dt>
                <dd>{prodUpStore?.data.people}</dd>
                <dt>타입</dt>
                <dd>
                  {prodUpStore?.data.meettype === "one"
                    ? "1회성 : 세미나 등"
                    : "다수의 일자가 존재 : 코칭 등"}
                </dd>

                {prodUpStore?.data.meettype === "one" && (
                  <>
                    <dt>온라인/오프라인 선택</dt>
                    <dd>{prodUpStore?.data.onoff}</dd>
                    {prodUpStore?.data.location && (
                      <>
                        <dt>장소</dt>
                        <dd>{prodUpStore?.data.location}</dd>
                      </>
                    )}
                    <dt>모임주기</dt>
                    <dd>{prodUpStore?.data.meetingcycle}</dd>
                    <dt>시작일</dt>
                    <dd>
                      {dayjs(prodUpStore?.data.firstmeet).format(
                        "YY년 M월 DD일 HH시 MM분"
                      )}
                    </dd>
                  </>
                )}
                <dt>상세페이지</dt>
                <dd
                  className="content"
                  css={css`
                    margin-top: 15px;
                  `}
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(prodUpStore?.data.body)
                  }}
                />
                <dt>금액</dt>
                <dd>{prodUpStore?.data.price}</dd>
                <dt>할인</dt>
                <dd>{prodUpStore?.data.saleprice}</dd>
                <dt>최종 금액</dt>
                <dd>{prodUpStore?.data.price - prodUpStore?.data.saleprice}</dd>
              </dl>
            </div>
            <p>를 등록하시겠습니까?</p>
            <AdminBoxBtn>
              <button onClick={() => router.back()}>뒤로</button>
              {prodUpStore.state === "create" ? (
                <button onClick={saveProduct}>등록</button>
              ) : (
                <button
                  onClick={() => modifyConfrimProduct(prodUpStore?.data._id)}
                >
                  수정
                </button>
              )}
            </AdminBoxBtn>
          </ConfirmView>
        </>
        )
      </AdminLayout>
    );
  }
  return <div>상품을 다시 등록해주세요</div>;
}

export default Confirm;
