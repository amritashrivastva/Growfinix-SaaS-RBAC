const express = require("express");

const {
  signup,
  login
} = require("../controllers/auth.controller");

const {
  verifyToken,
  checkRole
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

// Super Admin only
router.get(
  "/super-admin",
  verifyToken,
  checkRole("SUPER_ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Super Admin"
    });
  }
);

// Manager only
router.get(
  "/manager",
  verifyToken,
  checkRole("MANAGER"),
  (req, res) => {
    res.json({
      message: "Welcome Manager"
    });
  }
);

// User only
router.get(
  "/user",
  verifyToken,
  checkRole("USER"),
  (req, res) => {
    res.json({
      message: "Welcome User"
    });
  }
);

const prisma = require("../lib/prisma");

router.get(
  "/users",
  verifyToken,
  checkRole("SUPER_ADMIN"),
  async (req, res) => {
    const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    tenantId: true,
  },
});

    res.json(users);
  }
);

router.put(
  "/users/:id/role",
  verifyToken,
  checkRole("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role }
      });

      res.json(updatedUser);

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

router.delete(
  "/users/:id",
  verifyToken,
  checkRole("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id },
      });

      res.json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);

module.exports = router;