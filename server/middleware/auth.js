import { createRequire } from "module";
import express from "express";
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

export default (req, res, next) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
