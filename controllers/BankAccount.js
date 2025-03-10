import BankAccount from "../model/BankAccount.js";
import Transaction from "../model/Transaction.js";
import User from "../model/User.js";


export const getBalance = async (req, res) => {
    try {
        console.log("Decoded User:", req.user); 

        const account = await BankAccount.findOne({ user: req.user._id });

        if (!account) {
            return res.status(404).json({ message: "الحساب البنكي غير موجود" });
        }

        res.status(200).json({ balance: account.balance });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};


export const getTransactionHistory = async (req, res) => {
    try {
        const { email } = req.user;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        const account = await BankAccount.findOne({ user: user._id });

        if (!account) {
            return res.status(404).json({ message: "الحساب البنكي غير موجود" });
        }

        const transactions = await Transaction.find({
            $or: [{ sender: account._id }, { receiver: account._id }],
        }).populate("sender receiver", "user");

        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};
export const transferMoney = async (req, res) => {
    try {
        const { receiverEmail, amount } = req.body;

        if (!receiverEmail || !amount || amount <= 0) {
            return res.status(400).json({ message: "البيانات غير صحيحة" });
        }

      
        const senderUser = await User.findOne({ email: req.user.email });
        const receiverUser = await User.findOne({ email: receiverEmail });

        if (!senderUser || !receiverUser) {
            return res.status(404).json({ message: "حساب المرسل أو المستلم غير موجود" });
        }

   
        const senderAccount = await BankAccount.findOne({ user: senderUser._id });
        const receiverAccount = await BankAccount.findOne({ user: receiverUser._id });

        if (!senderAccount || !receiverAccount) {
            return res.status(404).json({ message: "حساب المرسل أو المستلم غير موجود" });
        }

        if (senderAccount.balance < amount) {
            return res.status(400).json({ message: "رصيد غير كافٍ" });
        }

   
        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        await senderAccount.save();
        await receiverAccount.save();

     
        const transaction = new Transaction({
            sender: senderAccount._id,
            receiver: receiverAccount._id,
            amount,
        });
        await transaction.save();

        res.status(200).json({ message: "تم التحويل بنجاح", transaction });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};
