import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import axios from "axios";

const options = {
  providers: [
    Providers.Kakao({
      clientId: process.env.KAKAO_ID,
      clientSecret: process.env.KAKAO_SECRET
    }),
    Providers.Google({
      clientId: process.env.Google_ID,
      clientSecret: process.env.Google_SECRET
    }),
    Providers.Credentials({
      name: "Custom Provider",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "john@doe.com" },
        userpwd: { label: "password", type: "password" }
      },
      async authorize(credentials, req) {
        const response = await axios.post(
          `${process.env.NEXTAUTH_URL}/api/user/login`,
          credentials
        );
        var t = response.data;
        if (t.data.status !== 0) {
          const user = {
            uid: t.data._id,
            profileimg: t.data.profileimg,
            email: t.data.email,
            name: t.data.name,
            nickname: t.data.nickname,
            role: t.data.role,
            phone: t.data.phone,
            agegroup: t.data.agegroup,
            gender: t.data.gender
          };
          return user;
        }
      }
    })
  ],
  pages: {
    error: "/signin"
  },
  session: {
    jwt: true

    // 리프레쉬토큰, 2주 maxAge: 14 * 24 * 60 * 60
  },
  jwt: {
    signingKey: JSON.stringify({
      kty: "oct",
      kid: process.env.NEXT_AUTH_KID,
      alg: "HS512",
      k: process.env.NEXT_AUTH_K
    })
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return "/";
    },
    jwt: async (token, user, account, profile, isNewUser) => {
      console.log("user 정보", user);
      if (user && account && profile) {
        if (isNewUser && account.type !== "credentials") {
          if (account.provider === "kakao") {
            //최초 소셜로그인시, db 에 저장
            try {
              const response = await axios.put(
                `${process.env.NEXTAUTH_URL}/api/user/${user.id}`,
                {
                  uid: user.id,
                  profileimg: user.image,
                  email: user.email,
                  name: user.name,
                  nickname: profile.kakao_account.profile.nickname,
                  agegroup: `${
                    profile.kakao_account.age_range.split("~")[0]
                  }대`,
                  gender:
                    profile.kakao_account.gender === "male" ? "남성" : "여성"
                }
              );
              token.user = response.data;
            } catch (err) {
              console.log(err);
            }
          }
          if (account.provider === "google") {
            try {
              const response = await axios.put(
                `${process.env.NEXTAUTH_URL}/api/user/${user.id}`,
                {
                  uid: user.id,
                  profileimg: user.image,
                  email: user.email,
                  name: user.name,
                  nickname: user.name
                }
              );
              token.user = response.data;
            } catch (err) {
              console.log(err);
            }
          }
        }

        if (!isNewUser && account.type !== "credentials") {
          var response = await axios.get(
            `${process.env.NEXTAUTH_URL}/api/user/${user.id}`
          );
          token.user = response.data;
        }

        if (account.type === "credentials") {
          token.user = user;
        }
      }
      return Promise.resolve(token);
    },
    session: async (session, token) => {
      session = token;
      session.user.uid ? session.user.uid : (session.user.uid = token.user._id);

      // session.user = user.user;

      // session.user.role
      //   ? session.user.role
      //   : (session.user.role = user.user.role);
      // session.user.nickname
      //   ? session.user.nickname
      //   : (session.user.nickname = user.user.nickname);
      return Promise.resolve(session);
    }
  },
  database: process.env.DATABASE_URL
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (req, res) => NextAuth(req, res, options);
