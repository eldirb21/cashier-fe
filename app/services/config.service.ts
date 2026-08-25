import { axiosInstance } from "@/app/libs/axios";

export const configService = {
  async getConfig() {
    const res = await axiosInstance.get("/config");
    return res.data;
  },
};
