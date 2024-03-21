import { useEffect, useMemo, useState } from "react";
import { GetServerSideProps } from "next";
import { signIn, signOut, useSession } from "next-auth/client";
import Link from "next/link";
import { getProviders } from "next-auth/client";
import { useRouter } from "next/router";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { ISignIn } from "../signin";
import { RegisterSeo } from "@components/elements/CommonSeo";
import Layout from "@components/layouts";
import SocialLogin from "@components/modules/SocialLogin";
import { IUser } from "@src/typings/db";
import RegisterForm from "@components/pageComp/register/styles";
import { ErrorTxt } from "pages/admin/product/styles";
import "react-toastify/dist/ReactToastify.css";
import useMediaUp from "@src/hooks/useMediaUp";
import { css } from "@emotion/react";

export default function Register({ providers, csrfToken }: ISignIn) {
  const {
    query: { callbackUrl }
  } = useRouter();

  const router = useRouter();
  const [profileimg, onImgUpHandler] = useMediaUp("user");

  console.log("profileimg", profileimg ? true : false);

  const [session] = useSession();
  console.log("session", session?.user);

  const {
    register,
    watch,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm({
    defaultValues: useMemo(() => {
      return {
        ...session?.user
      };
    }, [session?.user])
  }); // useForm({ mode: "onChange" });
  // console.log(watch("email"));

  // const userpwdConfirm = watch("userpwd");

  useEffect(() => {
    reset(session?.user);
  }, [session?.user, reset]);

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: IUser) => {
    setLoading(true);
    const { email, userpwd } = data;
    console.log("data", data);
    axios
      .put("/api/user/user", {
        ...data,
        profileimg: String(profileimg)
      })
      .then(resp => {
        console.log(resp);
        toast("회원정보 수정이 정상적으로 완료되었습니다.", {
          position: "top-center",
          autoClose: 2000
        });
        signOut();
        let timer = setTimeout(() => {
          window.location.replace("/");
          clearTimeout(timer);
        }, 2000);
      })
      .catch(e => {
        if (axios.isAxiosError(e)) {
          console.log({
            e,
            type: "axios-error"
          });
          alert(e?.response?.data);
        } else {
          console.log({
            e,
            type: "stock-error"
          });
        }
      });
    setLoading(false);
  };

  return (
    <Layout>
      <RegisterSeo />
      <RegisterForm>
        <div className="login_form">
          <h2>회원 정보 수정</h2>
          <p>
            회원 정보 수정 후 재로그인을 해야 수정된 내용이 반영됩니다. 회원정보
            수정완료 후 자동으로 로그아웃됩니다. 이후 로그인을 하면 변경된
            부분이 반영됩니다.
          </p>
          <div className="box_imgupload">
            <span className="imgArea">
              {profileimg ? (
                <img src={String(profileimg)} alt="모임대표이미지" />
              ) : session?.user.profileimg ? (
                <img src={session?.user.profileimg} alt="모임대표이미지" />
              ) : (
                <span
                  css={css`
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 15px 0;
                    border: 1px solid #ddd;
                    margin: 20px 0;
                    height: 200px;
                  `}
                >
                  등록된 프로필 이미지가 없습니다.
                </span>
              )}
            </span>
            <input
              type="file"
              id="upload"
              className="image-upload"
              onChange={onImgUpHandler}
            />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label>
              <div className="tit">Name</div>

              <div>
                <input
                  type="text"
                  placeholder="홍길동"
                  autoComplete="off"
                  {...register("name", {
                    required: true,
                    pattern: /^[가-힣]{2,7}$/
                  })}
                />
              </div>
            </label>
            {errors.name && errors.name.type === "required" && (
              <ErrorTxt>이름을 입력해주세요.</ErrorTxt>
            )}
            {errors.name && errors.name.type === "pattern" && (
              <ErrorTxt>
                이름 형식에 맞지 않습니다. 한글로 올바르게 이름을 입력해주세요.
              </ErrorTxt>
            )}
            <label>
              <div className="tit">NickName</div>

              <div>
                <input
                  type="text"
                  placeholder="닉네임을 입력해주세요."
                  autoComplete="off"
                  {...register("nickname", {
                    required: true,
                    pattern: /^[가-힣]{2,7}$/
                  })}
                />
              </div>
            </label>
            {errors.nickname && errors.nickname.type === "required" && (
              <ErrorTxt>닉네임을 입력해주세요.</ErrorTxt>
            )}
            {errors.nickname && errors.nickname.type === "pattern" && (
              <ErrorTxt>
                닉네임 형식에 맞지 않습니다. 한글로 올바르게 이름을
                입력해주세요.(2글자 이상, 7글자 이하)
              </ErrorTxt>
            )}
            <label>
              <div className="tit">Email</div>
              <div>
                <input
                  type="email"
                  placeholder="example@example.com"
                  autoComplete="off"
                  {...register("email", {
                    required: true,
                    pattern:
                      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
                  })}
                />
              </div>
            </label>
            {errors.email && <ErrorTxt>이메일을 입력해주세요.</ErrorTxt>}
            <label>
              <div className="tit">AGE GROUP</div>
              <div>
                <select id="agegroup" {...register("agegroup")}>
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="50대이상">50대이상</option>
                </select>
              </div>
            </label>
            <label>
              <div className="tit">GENDER</div>
              <div className="box_radio">
                <input
                  {...register("gender")}
                  type="radio"
                  value="남성"
                  id="male"
                />
                남성
                <input
                  {...register("gender")}
                  type="radio"
                  value="여성"
                  id="female"
                />
                여성
              </div>
            </label>
            <label>
              <div className="tit">Phone</div>
              <div>
                <input
                  type="number"
                  placeholder="01012345678"
                  autoComplete="off"
                  {...register("phone", {
                    required: true,
                    pattern: /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g
                  })}
                />
              </div>
            </label>
            {errors.phone && errors.phone.type === "required" && (
              <ErrorTxt>연락처를 정확하게 입력해주세요.</ErrorTxt>
            )}
            {errors.phone && errors.phone.type === "pattern" && (
              <ErrorTxt>연락처를 정확하게 입력해주세요.</ErrorTxt>
            )}
            <label>
              <div className="tit">Password</div>
              <div>
                <input
                  type="password"
                  defaultValue=""
                  autoComplete="off"
                  placeholder="영문 소문자 / 숫자 / 특수기호 중 2가지 이상 조합 8~16자"
                  {...register("userpwd", {
                    required: true,
                    minLength: 8,
                    maxLength: 16,
                    pattern:
                      /(?=.*\d{1,50})(?=.*[~`!@#$%\^&*()-+=]{1,50})(?=.*[a-zA-Z]{2,50}).{8,16}$/
                  })}
                />
              </div>
            </label>
            {errors.userpwd && errors.userpwd.type === "required" && (
              <ErrorTxt>비밀번호를 입력해주세요.</ErrorTxt>
            )}
            {errors.userpwd && errors.userpwd.type === "pattern" && (
              <ErrorTxt>
                영문 소문자 / 숫자 / 특수기호 중 2가지 이상 조합 8~16자
              </ErrorTxt>
            )}
            <label>
              <div className="tit">Password Confirm</div>
              <div>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="비밀번호 확인을 위해 입력해주세요."
                  {...register("userpwd_confirm", {
                    required: true
                    // validate: value => value === userpwdConfirm
                  })}
                />
              </div>
            </label>
            {errors.userpwd_confirm &&
              errors.userpwd_confirm.type === "required" && (
                <ErrorTxt>비밀번호 확인을 위해 입력하셔야합니다.</ErrorTxt>
              )}
            {errors.userpwd_confirm &&
              errors.userpwd_confirm.type === "validate" && (
                <ErrorTxt>비밀번호를 확인해주세요.</ErrorTxt>
              )}
            <input type="submit" disabled={loading} value="수정" />
          </form>
        </div>
      </RegisterForm>
      <ToastContainer />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const providers = await getProviders();

  return {
    props: { providers }
  };
};
