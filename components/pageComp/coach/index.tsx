import { css } from "@emotion/react";
import { useCoachs } from "@src/hooks/api/useCoachs/useCoach";
import { IProduct } from "@src/typings/db";
import axios from "axios";
import dayjs from "dayjs";
import { Session } from "next-auth";
import { useSession } from "next-auth/client";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

function Coach({ coachData }: { coachData: IProduct }) {
  const queryClient = useQueryClient();
  const [session] = useSession();
  const [coachArr, setcoachArr] = useState<any>([]);
  const [registerModal, setRegisterModal] = useState<any>({
    show: false,
    data: null
  });
  const [coach, setCoach] = useState<
    | {
        creator: string;
        maxLimit: number;
        startTime: string;
        endTime: string;
        price: number;
      }
    | any
  >({});

  useEffect(() => {
    console.log("coach coach", coach, "coachData coachData", coachData);
  }, [coach]);

  //불러오기
  const { status, data, error } = useCoachs(coachData._id);

  console.log("coachData._id coachData._id", data);

  // console.log(data);

  const addMutation = useMutation(
    () =>
      axios.patch(`/api/coach/${coachData._id}`, {
        creator: session?.user.uid,
        ...coach
      }),
    {
      onSuccess: () => queryClient.invalidateQueries("coachViewData"),
      onError: (error, variables, context) => {
        // I will fire first
        console.log(error, variables);
      }
    }
  );

  const deleteMutation = useMutation(
    (coachId: string) =>
      axios
        .delete(`/api/coach/${coachData._id}?coachId=${coachId}`)
        .then(res => {
          return res.data;
        }),
    {
      onSuccess: () => queryClient.invalidateQueries("coachViewData"),
      onError: (error, variables, context) => {
        // I will fire first
        console.log(error, variables);
      }
    }
  );

  console.log("");

  return (
    <div
      css={css`
        overflow: hidden;
        position: relative;

        h2 {
          margin: 0px 0 10px;
        }
        .wrap_tbl_coach,
        .generator_coach {
          float: left;
        }

        .wrap_tbl_coach {
          width: calc(100% - 400px);
          margin-right: 30px;
        }

        .wrap_table {
          overflow-y: auto;
          height: 300px;
          max-height: 300px;
        }

        .tbl_coach {
          th,
          td {
            height: 50px;
            border: 1px solid;
            padding: 0;
            font-size: 12px;
          }
        }
        .generator_coach {
          .wrap {
            position: relative;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 10px;
            height: 210px;
            .box {
              margin-bottom: 10px;
              label {
                display: inline-block;
                width: 75px;
              }
            }
            button {
              bottom: 15px;
              position: absolute;
              right: 15px;
              background: #000;
              color: #fff;
              padding: 5px;
              border-radius: 7px;
            }
          }
        }
      `}
    >
      <div className="wrap_tbl_coach">
        <h2> [{data?.title}] 코칭 등록 정보</h2>
        <div className="wrap_table">
          <table className="tbl_coach">
            <colgroup>
              <col width="220" />
              <col width="220" />
              <col width="220" />
              <col width="220" />
              <col width="220" />
              <col width="100" />
            </colgroup>
            <thead>
              <tr>
                <th>시작</th>
                <th>종료</th>
                <th>가격</th>
                <th>인원</th>
                <th>신청자</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {data?.coach?.map(el => (
                <tr key={el._id}>
                  <td style={{ textAlign: "center" }}>
                    {dayjs(el.startTime).format(`YY.MM.DD (ddd) / HH시MM분`)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {dayjs(el.endTime).format(`YY.MM.DD (ddd)  / HH시MM분`)}
                  </td>
                  <td style={{ textAlign: "center" }}>{el.price}</td>
                  <td style={{ textAlign: "center" }}>{el.maxLimit}</td>
                  <td>
                    {el.register.length !== 0 && (
                      <span
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center"
                        }}
                        onClick={() =>
                          setRegisterModal({ show: true, data: el.register })
                        }
                      >
                        신청자 보기 ({el.register.length} 명)
                      </span>
                    )}
                    {registerModal.show && (
                      <div
                        css={css`
                          width: 500px;
                          height: 300px;
                          padding: 15px;
                          position: absolute;
                          top: 0;
                          left: 100px;
                          background: #fff;
                          border: 1px solid;
                          z-index: 1000;
                        `}
                      >
                        {registerModal.data.map((el: any, i: number) => (
                          <div key={i}>
                            {el.userinfo.name} : {el.userinfo.phone}{" "}
                            {el.userinfo.email}
                          </div>
                        ))}
                        <span
                          css={css`
                            position: absolute;
                            top: 10px;
                            right: 20px;
                          `}
                          onClick={() =>
                            setRegisterModal({ show: false, data: null })
                          }
                        >
                          X
                        </span>
                      </div>
                    )}
                  </td>

                  <td>
                    {el.register.length === 0 && (
                      <button onClick={() => deleteMutation.mutate(el._id)}>
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="generator_coach">
        <h2>코치 예약기능 만들기</h2>
        <div className="wrap">
          <div className="box">
            <label htmlFor="maxLimit">인원</label>
            <input
              type="number"
              id="maxLimit"
              value={coach.maxLimit}
              onChange={e =>
                setCoach({ ...coach, maxLimit: Number(e.target.value) })
              }
            />{" "}
            명
          </div>
          <div>
            <div className="box">
              <label htmlFor="startTime">시작시간</label>
              <input
                type="datetime-local"
                placeholder="날짜"
                id="startTime"
                value={coach.startTime}
                onChange={e =>
                  setCoach({ ...coach, startTime: e.target.value })
                }
              />
            </div>
            <div className="box">
              <label htmlFor="endTime">마감시간</label>
              <input
                type="datetime-local"
                placeholder="날짜"
                id="endTime"
                value={coach.endTime}
                onChange={e => setCoach({ ...coach, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="box">
            <label htmlFor="price">코칭비용</label>
            <input
              type="number"
              value={coach.price}
              id="price"
              onChange={e =>
                setCoach({ ...coach, price: Number(e.target.value) })
              }
            />{" "}
            원
          </div>
          <button onClick={() => addMutation.mutate()}>추가</button>

          {/* <input type="datetime-local" placeholder="날짜" id="firstmeet" /> */}
        </div>
      </div>
    </div>
  );
}

export default Coach;
