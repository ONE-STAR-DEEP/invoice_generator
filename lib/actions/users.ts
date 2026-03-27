"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import db from "../dbPool";
import { BankAccount, SellerCompany, SessionUser, User, UserData } from "../types/dataTypes";
import bcrypt from "bcrypt"

import crypto from "crypto"
import { getCurrentUserSafe } from "../sessionCheck";

const algorithm = "aes-256-cbc"
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "utf-8")

export async function encrypt(text: string, ivHex: string) {

    const iv = Buffer.from(ivHex, "hex")

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return encrypted
}

export async function decrypt(encrypted: string, ivHex: string) {

    const iv = Buffer.from(ivHex, "hex")

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}

export const createUser = async (data: User) => {
    const conn = await db.getConnection();

    try {
        if (!data.email || !data.password || !data.name || !data.mobile) {
            return {
                success: false,
                message: "Missing required fields"
            };
        }
        const session = await getCurrentUserSafe();

        const userId = session?.id;

        if (
            !userId ||
            session.iss !== "thaverTechInvoiceGenerator" ||
            session.role !== "admin"
        ) {
            return { success: false, message: "Unauthorized" };
        }

        const iv = crypto.randomBytes(16)

        const {
            name,
            role
        } = data;

        const normalizedEmail = data.email.toLowerCase().trim()
        const normalizedMobile = data.mobile.trim();

        const emailHash = crypto
            .createHash("sha256")
            .update(normalizedEmail)
            .digest("hex")

        const [existing]: any = await conn.execute(
            `SELECT id FROM users WHERE email_hash = ?`,
            [emailHash]
        );

        if (existing.length > 0) {
            return {
                success: false,
                message: "User already exists"
            };
        }

        const emailEncrypted = await encrypt(normalizedEmail, iv.toString("hex"))
        const mobileEncrypted = await encrypt(normalizedMobile, iv.toString("hex"));

        const passwordHash = await bcrypt.hash(data.password, 10);

        const [result]: any = await conn.execute(
            `
        INSERT INTO users (
            name,
            email_hash,
            email_encrypted,
            mobile_encrypted,
            password_hash,
            encryption_iv,
            role
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            [
                name,
                emailHash,
                emailEncrypted,
                mobileEncrypted,
                passwordHash,
                iv.toString("hex"),
                role
            ]
        );

        return {
            success: true,
            message: "User Created",
            insertId: result.insertId
        };

    } catch (error: any) {
        console.error("Failed to Create user", error);

        return {
            success: false,
            message: error.message || "Something went wrong"
        };

    } finally {
        conn.release();
    }
}

export const loginUser = async (data: User) => {

    const conn = await db.getConnection();

    try {

        const normalizedEmail = data.email.toLowerCase().trim()

        const emailHash = crypto
            .createHash("sha256")
            .update(normalizedEmail)
            .digest("hex")

        const [rows]: any = await conn.execute(
            `
        SELECT
            id,
            name,
            password_hash,
            encryption_iv,
            role
        FROM users
        WHERE email_hash = ?
        `,
            [emailHash]
        );

        if (rows.length === 0) {
            return {
                success: false,
                message: "User not found"
            }
        }

        const user = rows[0]

        const isMatch = await bcrypt.compare(data.password, user.password_hash)

        if (!isMatch) {
            return {
                success: false,
                message: "Invalid credentials"
            }
        }

        const otp = "123456"

        // await generateOTP();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);
        const query = `
        INSERT INTO otps (user_id, identifier, otp, expires_at)
        VALUES (?, ?, ?, ?)
        `;

        const res = await conn.execute(query, [
            user.id,
            data.email,
            otp,
            expires_at
        ]);

        const sendingOTP = {
            success: true,
            message: "OTP Sent"
        }
        // await sendLoginOtpEmail(email, otp);

        if (!sendingOTP.success) {
            return {
                success: false,
                message: "Failed to send OTP"
            }
        }

        return {
            success: true,
            message: "OTP Sent Successfully",
        }

    } catch (error: any) {
        console.error("Failed to Find user", error);

        return {
            success: false,
            message: error.message || "Something went wrong"
        };

    } finally {
        conn.release();
    }
}

export const verifyOtp = async (email: string, inputOTP: string) => {

    const conn = await db.getConnection();

    try {

        const normalizedEmail = email.toLowerCase().trim()

        const emailHash = crypto
            .createHash("sha256")
            .update(normalizedEmail)
            .digest("hex")

        const [rows]: any = await conn.execute(
            `
            SELECT 
                o.id,
                o.otp,
                o.user_id,
                o.attempts,
                u.role
                FROM otps o
                JOIN users u ON o.user_id = u.id
                WHERE o.identifier = ?
                AND o.expires_at > NOW()
                ORDER BY o.created_at DESC
                LIMIT 1
            `,
            [email]
        );

        if (!rows.length) {
            return { success: false, errno: 410, message: "OTP expired or not found" };
        }

        const { id, otp, user_id, attempts, role } = rows[0];

        // Block after 3 attempts
        if (attempts > 3) {
            return { success: false, errno: 429, message: "Too many attempts. Try again later." };
        }

        // Increment attempts ALWAYS
        await conn.execute(
            `UPDATE otps SET attempts = attempts + 1 WHERE id = ?`,
            [id]
        );

        // Compare OTP
        if (otp !== inputOTP) {
            return { success: false, errno: 401, message: "Invalid OTP" };
        }

        // Invalidate OTP after success
        await conn.execute(
            `UPDATE otps SET expires_at = NOW() WHERE id = ?`,
            [id]
        );

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign(
            {
                id: Number(user_id) as Number,
                role: role as SessionUser["role"]
            },
            JWT_SECRET!,
            {
                expiresIn: "1d",
                issuer: "thaverTechInvoiceGenerator"
            } //  
        );

        const isProd = process.env.NODE_ENV === "production";

        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60,
        });

        return {
            success: true,
            message: "Login successful",
            user: {
                id: user_id
            }
        }

    } catch (error: any) {
        console.error("Failed to Find user", error);

        return {
            success: false,
            message: error.message || "Something went wrong"
        };

    } finally {
        conn.release();
    }

}

export const fetchUserData = async () => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const [rows]: any = await conn.query(
            "SELECT * FROM users"
        );

        const users = await Promise.all(
            rows.map(async (user: any) => ({
                id: user.id,
                name: user.name,
                email: await decrypt(user.email_encrypted, user.encryption_iv),
                mobile: await decrypt(user.mobile_encrypted, user.encryption_iv),
                role: user.role,
                created_at: user.created_at
            }))
        );


        return {
            success: true,
            data: users as UserData[],
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            data: null,
            message: "Failed to fetch data",
        };
    } finally {
        conn.release();
    }
};

export const fetchCompanyData = async () => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const [rows]: any = await conn.query(
            "SELECT * FROM companies"
        );

        return {
            success: true,
            data: rows[0] as SellerCompany,
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            data: null,
            message: "Failed to fetch data",
        };
    } finally {
        conn.release();
    }
};

export const fetchBankAccountData = async () => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const [rows]: any = await conn.query(
            "SELECT * FROM company_bank_details",
            [userId]
        );

        return {
            success: true,
            data: rows[0] as BankAccount,
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            data: null,
            message: "Failed to fetch data",
        };
    } finally {
        conn.release();
    }
};