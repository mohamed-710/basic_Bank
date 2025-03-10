import jwt from "jsonwebtoken";
import User from "../model/User.js"; 

export const verifyToken = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select("-password"); // البحث عن المستخدم بدون كلمة المرور

            if (!req.user) {
                return res.status(404).json({ message: "المستخدم غير موجود" });
            }

            next();
        } else {
            res.status(401).json({ message: "غير مصرح لك" });
        }
    } catch (error) {
        res.status(401).json({ message: "توكن غير صالح" });
    }
};