import axios from "axios";
import { useQuery } from "react-query";
import { IPayment } from "@src/typings/db";

const fetchUser = async () => {
  const res = await axios.get(`/api/user`);
  return res.data;
};

const useUser = () => {
  return useQuery<any[], Error>(["users"], async () => await fetchUser());
};

export { useUser, fetchUser };
