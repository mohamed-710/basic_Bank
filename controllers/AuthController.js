import User from "../model/User.js";
import jwt from "jsonwebtoken";
import BankAccount from "../model/BankAccount.js";

const generateJwt = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "البيانات مطلوبة" });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ message: "البريد الإلكتروني موجود بالفعل" });
        }

        const newUser = new User({ email, password, name });
        await newUser.save();
        const bankAccount = new BankAccount({
            user: newUser._id,
            balance:10000, 
        });
        await bankAccount.save();

        const token = generateJwt(newUser._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "تم التسجيل بنجاح",
            user: { 
                name:newUser.name,
                email:newUser.email,
                password: undefined,
             }
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.checkPassword(password))) {
            return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        const token = generateJwt(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            user: { ...user._doc, password: undefined,token },
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

const logout = (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

export { login, signup, logout };
