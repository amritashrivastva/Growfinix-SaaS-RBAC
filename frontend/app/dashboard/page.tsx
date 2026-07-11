"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    setRole(savedRole || "");

    if (savedRole === "SUPER_ADMIN") {
      fetch("http://localhost:5000/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
.then((data) => {
  if (Array.isArray(data)) {
    setUsers(data);
  } else if (Array.isArray(data.users)) {
    setUsers(data.users);
  } else {
    console.log("API Response:", data);
    setUsers([]);
  }
})
.catch((err) => {
  console.error(err);
  setUsers([]);
});
    }
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚀 Dashboard</h1>

      <h2>Role: {role}</h2>

      {/* SUPER ADMIN */}
      {role === "SUPER_ADMIN" && (
        <div>
          <h3>👑 Super Admin Panel</h3>
          <h4>Users List</h4>

          {users.map((user: any) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <span>
                {user.name} | {user.email} | {user.role}
              </span>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await fetch(
                    `http://localhost:5000/api/auth/users/${user.id}/role`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        role:
                          user.role === "USER"
                            ? "MANAGER"
                            : "USER",
                      }),
                    }
                  );

                  location.reload();
                }}
              >
                Change Role
              </button>
              <button
  style={{
    marginLeft: "10px",
    background: "red",
    color: "white",
    padding: "5px 10px",
    cursor: "pointer",
  }}
  onClick={async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/auth/users/${user.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    alert(data.message);

    location.reload();
  }}
>
  Delete
</button>
            </div>
          ))}
        </div>
      )}

      {/* MANAGER */}
      {role === "MANAGER" && <h3>📊 Manager Panel</h3>}

      {/* USER */}
      {role === "USER" && <h3>👤 User Panel</h3>}

      <button
        onClick={logout}
        style={{ marginTop: "20px", padding: "8px 15px" }}
      >
        Logout
      </button>
    </div>
  );
}