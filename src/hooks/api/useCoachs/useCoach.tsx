import { useQuery } from "react-query";
import axios from "axios";
import { INotice, IProduct } from "@src/typings/db";

interface ICoach {
  _id: string;
  creator: string;
  maxLimit: number;
  startTime: string;
  endTime: string;
  price: number;
  register: string[];
}

const fetchCoachs = async (id: string) => {
  const res = await axios.get(`/api/coach/${id}`);
  return res.data;
};

const useCoachs = (id: string) => {
  return useQuery<IProduct | null, Error>(
    ["coachViewData", id],
    () => fetchCoachs(id),
    {
      enabled: id !== "undefined",
      refetchOnWindowFocus: false
    }
  );
};

export { useCoachs, fetchCoachs };
