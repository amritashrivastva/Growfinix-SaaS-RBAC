const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ---------------- SIGNUP ---------------- */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: `${name} Company`,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        tenantId: tenant.id,
      },
    });

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: "Signup successful",
      user: safeUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

/* ---------------- LOGIN ---------------- */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
  {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
  },
  "mysecretkey",
  { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
  {
    id: user.id,
  },
  "refreshsecret",
  { expiresIn: "7d" }
);

return res.status(200).json({
  message: "Login successful",
  accessToken,
  refreshToken,
  role: user.role,
});

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { signup, login };