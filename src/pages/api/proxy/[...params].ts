import { NEW_API_URL, OLD_API_URL } from "edilkamin";
import type { NextApiRequest, NextApiResponse } from "next";

const API_URL =
  process.env.NEXT_PUBLIC_USE_LEGACY_API === "true" ? OLD_API_URL : NEW_API_URL;

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  const { params } = req.query;
  const resource = API_URL + (Array.isArray(params) ? params : []).join("/");
  const { method, body } = req;
  const headers = {
    Authorization: req.headers.authorization || "",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const baseOptions = { method, headers };
  const options = body
    ? { ...baseOptions, body: JSON.stringify(body) }
    : baseOptions;
  const response = await fetch(resource, options);
  const { status } = response;
  const json = await response.json();
  res.status(status).json(json);
};

export default handler;
