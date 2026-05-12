import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  city: user.city,
  role: user.role,
  createdAt: user.createdAt,
});

const normalizePhone = (value = "") => value.replace(/[^\d+]/g, "").trim();
const isEmail = (value = "") => value.includes("@");

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const normalizedPhone = phone ? normalizePhone(phone) : null;
    if (normalizedPhone) {
      const existingPhoneUser = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
        select: { id: true },
      });
      if (existingPhoneUser) {
        return res.status(409).json({ message: "An account with this phone already exists." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: normalizedPhone || null,
        city: city?.trim() || null,
      },
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const rawIdentifier = String(identifier || email || phone || "").trim();

    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: "Email or phone and password are required." });
    }

    const user = isEmail(rawIdentifier)
      ? await prisma.user.findUnique({
          where: { email: rawIdentifier.toLowerCase() },
        })
      : await prisma.user.findFirst({
          where: { phone: normalizePhone(rawIdentifier) },
        });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);

    return res.json({
      message: "Logged in successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
};
