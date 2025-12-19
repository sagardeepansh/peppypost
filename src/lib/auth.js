import jwt from "jsonwebtoken";

export function verifyApiAuth(req) {
  const cookie = req.headers.get("cookie");

  if (!cookie) {
    throw new Error("No cookie found");
  }

  const token = cookie
    .split("; ")
    .find(row => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    throw new Error("No token found");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}
