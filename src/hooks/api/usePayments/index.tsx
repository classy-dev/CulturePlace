import axios from "axios";
import { useQuery } from "react-query";
import { IPayment } from "@src/typings/db";

const fetchPayment = async (userid: string | undefined) => {
  const res = await axios.get(`/api/payment?userid=${userid}`);
  return res.data;
};

const fetchAdminPayment = async (role: string | undefined) => {
  const res = await axios.get(`/api/payment/admin?role=${role}`);
  return res.data;
};

const usePayment = (userid: string | undefined) => {
  return useQuery<any[], Error>(
    ["paymentData", userid],
    async () => await fetchPayment(userid)
  );
};

const useAdminPayment = (role: string | undefined | null) => {
  return useQuery<any[], Error>(
    ["paymentAdminData"],
    async () => await fetchAdminPayment(String(role)),
    {
      enabled: role !== undefined && role !== null,
      refetchOnWindowFocus: false
    }
  );
};

export { usePayment, useAdminPayment, fetchPayment };
