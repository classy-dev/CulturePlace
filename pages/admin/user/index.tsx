import AdminLayout from "@components/layouts/Admin/layout";
import { IndexTable, WrapIndexContent } from "../product/styles";
import { useSession } from "next-auth/client";
import { useAdminPayment } from "@src/hooks/api/usePayments";
import axios from "axios";
import { css } from "@emotion/react";
import dayjs from "dayjs";
import { useUser } from "@src/hooks/api/useUser";
import { IUser } from "@src/typings/db";
import { useEffect, useState } from "react";

function UserSelect({ userid, selected }: any) {
  const [role, setRole] = useState(selected);

  const handlerUserRole = (e: any) => {
    setRole(e.target.value);
    axios
      .patch(`/api/user?_id=${userid}&role=${e.target.value}`)
      .then(res => {});
  };

  return (
    <select value={role} onChange={e => handlerUserRole(e)}>
      <option value="master">master</option>
      <option value="creator">creator</option>
      <option value="user">user</option>
      <option value="block">block</option>
    </select>
  );
}

function Index() {
  const [session] = useSession();
  const { status, data, error } = useUser();

  console.log("data data", data);

  return (
    <AdminLayout>
      <WrapIndexContent>
        <IndexTable>
          <thead>
            <tr>
              <th>닉네임</th>
              <th>이름</th>
              <th>연락처</th>
              <th>성별</th>
              <th>연령</th>
              <th>가입일</th>
              <th>등급</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((el: IUser) => (
              <tr key={el._id}>
                <td>{el.nickname}</td>
                <td>{el.name}</td>
                <td>{el.phone}</td>
                <td>{el.gender}</td>

                <td>{el.agegroup}</td>
                <td>{dayjs(el.createdAt).format(`YY.MM.DD`)}</td>
                <td>
                  <UserSelect userid={el._id} selected={el.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </IndexTable>
      </WrapIndexContent>
    </AdminLayout>
  );
}

export default Index;
