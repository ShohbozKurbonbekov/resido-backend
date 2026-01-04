import axios from "axios";
import Errors, { HttpCode, Message } from "../Errors";

export async function geocodeAddress(address: string) {
  const apiKey = process.env.POSITIONSTACK_API_KEY;
  const url = `https://api.positionstack.com/v1/forward?access_key=${apiKey}&query=${encodeURIComponent(
    address
  )}&limit=1`;

  const response = await axios.get(url, {
    params: {
      access_key: apiKey,
      query: address,
      limit: 1,
    },
  });

  const data = response.data;

  if (data.error) {
    throw new Errors(
      HttpCode.BAD_REQUEST,
      data.error.message || "Something wrong with Geo fetching"
    );
  }
  if (!data || !data?.data || data?.data?.length === 0) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.NO_ADDDRESS_GEO);
  }

  const result = data.data[0];

  if (result.latitude == null || result.longitude == null) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_GEO);
  }

  return {
    lat: Number(result.latitude),
    long: Number(result.longitude),
  };
}
