import { useEffect, useCallback, useState, MouseEvent } from "react";
import { useSession } from "next-auth/client";
import router from "next/router";
import { useQueryClient, useMutation } from "react-query";
import axios from "axios";
import { useProducts } from "@src/hooks/api/useProducts";
import { runInAction } from "mobx";
import { prodUpStore } from "@src/mobx/store";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import Pagination from "rc-pagination";
import AdminLayout from "@components/layouts/Admin/layout";
import VodManagement from "@components/pageComp/creator/VodManagement";
import IsLive from "@components/pageComp/creator/IsLive";
import MeetInfo from "@components/pageComp/creator/MeetInfo";
import SearchComForm from "@components/elements/SearchComForm";
import { IProduct } from "@src/typings/db";
import {
  AdminModal,
  Dimm,
  GlowBtn,
  IndexTable,
  WrapIndexContent
} from "@components/pageComp/creator/styles";
import "rc-pagination/assets/index.css";
import Coach from "@components/pageComp/coach";
import { css } from "@emotion/react";
import e from "express";
import { mq } from "@components/mq";

dayjs.locale("ko");

export default function List() {
  const queryClient = useQueryClient();

  // 검색을 위한 useState
  const [findKeyWord, setfindKeyWord] = useState("");

  //검색
  const handlerSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    refetch();
    setfindKeyWord("");
  };

  /* 테이블 data 구성 및 pagination */
  const [pageSize, setPageSize] = useState(20);
  const [curPage, setCurPage] = useState(1);
  const [showMemInfo, setshowMemInfo] = useState({ show: false, _id: "" });

  const [paymentModal, setPaymentModal] = useState({ data: [], show: false });

  //세션 정보 가져오기
  const [session] = useSession();

  //제품 정보 불러오기  limit, pageParam, genre,  creator?: string
  const { status, data, error, refetch } = useProducts(
    pageSize,
    curPage,
    undefined,
    findKeyWord,
    "creator"
  );

  // 페이징 (페이지 이동)
  const handlePageChange = useCallback((page: number) => {
    setCurPage(page);
  }, []);

  console.log(session);

  // 회원은 role 이 있음. master, creator, user. creator 가 아닌 그냥 user 일시, apply 페이지로 이동
  useEffect(() => {
    session === null && router.back();
    session?.user.role === "user" && router.push("./creator/apply");
  }, [session, session?.user]);

  //상풍등록하러가기
  const writeProduct = useCallback(() => {
    runInAction(() => {
      prodUpStore.moveCreateProduct();
    });
  }, []);

  //상풍수정하러가기
  const modifyProduct = (_id: string) => {
    runInAction(() => {
      prodUpStore.moveModifyProduct(_id);
    });
  };

  //상풍삭제
  const deleteMutation = useMutation(
    (_id: string) =>
      axios.delete(`/api/product/${_id}`).then(res => {
        return res.data;
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(["list"]),
      onError: (error, variables, context) => {
        // I will fire first
      }
    }
  );

  //islive  를 위한 useState
  const [showLiveModal, setShowLiveModal] = useState({
    show: false,
    productId: "",
    productName: "",
    islive: false
  });

  //레이어모달 - islive 보이기
  const handlerShowLiveModal = useCallback(
    (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, el: IProduct) => {
      e.stopPropagation();
      setShowLiveModal({
        show: true,
        productId: el._id,
        productName: el.title,
        islive: el.islive
      });
    },
    []
  );

  // 레슨추가 modal
  const [vodManagement, setVodManagement] = useState({ _id: "", show: false });
  const handlerVodModal = useCallback((_id: string) => {
    setVodManagement({ _id, show: true });
  }, []);
  const handlerCloseVodModal = useCallback(() => {
    setVodManagement({ _id: "", show: false });
  }, []);

  // 코칭 관리
  const [showCoach, setShowCoach] = useState<{ show: boolean; data: any }>({
    show: false,
    data: {}
  });

  const handlerPaymentView = (el: any) => {
    // product _id 는 paymnetid
    console.log(el._id);
    axios.get(`/api/payment/${el._id}`).then(res => {
      console.log(res.data);
      setPaymentModal({ data: res.data, show: true });
    });
  };

  const paymentDoneData = paymentModal.data.filter(
    (el: any) => el.data.status !== "CANCEL"
  );

  return (
    <>
      {(session?.user.role === "creator" ||
        session?.user.role === "master") && (
        <>
          {status === "loading" ? (
            <AdminLayout genre={"creator"}>Loading...</AdminLayout>
          ) : status === "error" ? (
            <AdminLayout genre={"creator"}>Error: {error?.message}</AdminLayout>
          ) : (
            <AdminLayout genre={"creator"}>
              <WrapIndexContent>
                <div className="wrap_search">
                  <p>{session?.user.name} 님 반갑습니다.</p>
                  <SearchComForm
                    className="search_form"
                    handlerSearch={handlerSearch}
                    findKeyWord={findKeyWord}
                    setfindKeyWord={setfindKeyWord}
                  />
                </div>
                <IndexTable>
                  <colgroup>
                    <col width="*" />
                    <col width="*" />
                    <col width="20%" />
                    <col width="*" />
                    <col width="*" />
                    <col width="*" />
                    <col width="120px" />
                    <col width="*" />
                    <col width="158px" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">no.</th>
                      <th scope="col">대표이미지</th>
                      <th scope="col">제목</th>
                      <th scope="col">모임정보</th>
                      <th scope="col">장소</th>
                      <th scope="col">시작일</th>
                      <th scope="col">status</th>
                      <th scope="col">판매현황</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.products.map((el, i) => (
                      <tr key={el._id} onClick={() => modifyProduct(el._id)}>
                        <td>{i + 1 + (curPage - 1) * pageSize}</td>
                        <td>
                          <img src={el.imgurl} alt={el.title} />
                        </td>
                        <td className="title">{el.title}</td>
                        <td>
                          {el.joinMembr.length > 0 && (
                            <span
                              onClick={e => {
                                e.stopPropagation();
                                setshowMemInfo({
                                  show: true,
                                  _id: el._id
                                });
                              }}
                            >
                              보기 ({el.joinMembr.length})
                            </span>
                          )}
                        </td>

                        <td>{el.location}</td>
                        <td>
                          {el.meettype === "multiple" ? (
                            <span
                              onClick={e => {
                                e.stopPropagation();
                                setShowCoach({ show: true, data: el });
                              }}
                            >
                              코칭관리
                            </span>
                          ) : (
                            <span>
                              {dayjs(el.firstmeet).format(`YY.MM.DD (ddd)`)}
                            </span>
                          )}
                        </td>
                        <td className="live_status">
                          {session?.user.role === "master" ? (
                            <button onClick={e => handlerShowLiveModal(e, el)}>
                              {el.islive ? "live" : "unlive"}
                            </button>
                          ) : (
                            <span>{el.islive ? "live" : "검토중"}</span>
                          )}
                        </td>
                        <td
                          css={css`
                            position: relative;
                          `}
                        >
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              handlerPaymentView(el);
                            }}
                          >
                            판매현황보기
                          </span>
                        </td>
                        <td className="btn_wrap">
                          <div className="box_btn_group">
                            {el.isvod === true && (
                              <button
                                className="btn_vod"
                                onClick={e => {
                                  e.stopPropagation();
                                  handlerVodModal(el._id);
                                }}
                              >
                                VOD 관리
                              </button>
                            )}
                            {el.joinMembr.length !== 0 ? (
                              <></>
                            ) : (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(el._id);
                                }}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </IndexTable>
                {paymentModal.show && (
                  <>
                    <div
                      css={css`
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);

                        background: #fff;
                      `}
                    >
                      <div
                        css={css`
                          display: flex;
                          padding: 10px 15px;
                          padding-bottom: 7px;
                          border-bottom: 1px solid #ccc;
                        `}
                      >
                        판매현황 보기
                        <button
                          css={css`
                            margin-left: auto;
                          `}
                          onClick={() =>
                            setPaymentModal({ ...paymentModal, show: false })
                          }
                        >
                          X
                        </button>
                      </div>
                      {/* {paymentModal.data.} */}
                      <div
                        css={css`
                          padding: 15px;
                        `}
                      >
                        <table
                          css={css`
                            width: 600px;
                            ${mq[0]} {
                              width: 300px;
                            }
                            margin-bottom: 10px;
                            th,
                            td {
                              padding: 5px 0;
                              text-align: center;
                              border: 1px solid #aaa;
                            }
                            td {
                              color: #000;
                              padding: 0 15px;
                            }
                          `}
                        >
                          <thead>
                            <tr>
                              <th>No.</th>
                              <th>title</th>
                              <th>결제일자</th>
                              <th>금액</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentDoneData.length === 0 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  css={css`
                                    padding: 15px !important;
                                    text-align: center;
                                  `}
                                >
                                  아직 판매가 이루어지지 않았습니다.
                                </td>
                              </tr>
                            )}
                            {paymentDoneData.map((el: any, i: number) => (
                              <>
                                {el.data.status === "DONE" && (
                                  <tr>
                                    <td>{i + 1}</td>
                                    <td>{el.data.orderName}</td>

                                    <td>
                                      {dayjs(el.data.approvedAt).format(
                                        "YY.MM.DD / HH:MM"
                                      )}
                                    </td>
                                    <td>{el.data.balanceAmount}원</td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>

                        <div
                          css={css`
                            text-align: right;
                          `}
                        >
                          총 금액 :{" "}
                          {paymentDoneData.reduce(function (tot, el) {
                            return tot + (el as any).data.balanceAmount;
                          }, 0)}{" "}
                          원
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {showCoach.show && (
                  <AdminModal style={{ width: "70%" }}>
                    <span
                      className="btn_close"
                      onClick={() => setShowCoach({ show: false, data: {} })}
                    >
                      X
                    </span>
                    <Coach coachData={showCoach.data} />
                  </AdminModal>
                )}
                {showMemInfo.show && (
                  <AdminModal>
                    <MeetInfo
                      showMemInfo={showMemInfo}
                      setshowMemInfo={setshowMemInfo}
                      products={data?.products}
                    />
                  </AdminModal>
                )}
                {showLiveModal.show && (
                  <AdminModal>
                    <IsLive
                      showLiveModal={showLiveModal}
                      setShowLiveModal={setShowLiveModal}
                      refetch={refetch}
                    />
                  </AdminModal>
                )}
                {vodManagement.show && (
                  <>
                    <Dimm />
                    <AdminModal>
                      <VodManagement
                        _id={vodManagement._id}
                        handlerCloseVodModal={handlerCloseVodModal}
                      />
                    </AdminModal>
                  </>
                )}
                <Pagination
                  onChange={handlePageChange}
                  current={curPage}
                  showSizeChanger
                  pageSize={pageSize}
                  total={data?.productsCount}
                />
                <GlowBtn onClick={writeProduct}>상품등록</GlowBtn>
              </WrapIndexContent>
            </AdminLayout>
          )}
        </>
      )}
    </>
  );
}
