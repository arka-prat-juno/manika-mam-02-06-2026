import {
    Form,
    useLoaderData,
    redirect
} from "react-router";

import bcrypt from "bcryptjs";

import {
    eq
} from "drizzle-orm";

import {
    db 
} from "../../database/db.server";

import {
    users,
    profiles
} from "../../database/schema.server";

import {
    requireAdmin
} from "~/utils/auth.server";

export async function loader({
    request 
}: any) {
    await requireAdmin(request);

    const allUsers = await db.query.users.findMany({
        with: {
            profile: true
        },
        orderBy: (users, {
            asc 
        }) => [
            asc(users.id)
        ]
    });

    return {
        users: allUsers
    };
}

export async function action({
    request 
}: any) {
    const admin = await requireAdmin(request);

    const formData = await request.formData();

    const intent = formData.get("intent");

    /*
    =========================
    CREATE USER
    =========================
    */

    if (intent === "create-user") {
        const username = String(formData.get("username"));
        const password = String(formData.get("password"));
        const role = String(formData.get("role"));

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return {
                error: "Invalid username"
            };
        }

        if (password.length < 6) {
            return {
                error: "Password too short"
            };
        }

        if (
            role !== "admin" &&
            role !== "participant"
        ) {
            return {
                error: "Invalid role"
            };
        }

        const existing = await db.query.users.findFirst({
            where: eq(users.username, username)
        });

        if (existing) {
            return {
                error: "Username already exists"
            };
        }

        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        const [
            newUser
        ] = await db
            .insert(users)
            .values({
                username,
                passwordHash
            })
            .returning();

        await db.insert(profiles).values({
            userId: newUser.id,
            role
        });

        return redirect("/dashboard/manage-users");
    }

    /*
    =========================
    DELETE USER
    =========================
    */

    if (intent === "delete-user") {
        const userId = Number(formData.get("userId"));

        // prevent self delete
        if (userId === admin.id) {
            return {
                error: "You cannot delete yourself"
            };
        }

        await db
            .delete(users)
            .where(eq(users.id, userId));

        return redirect("/dashboard/manage-users");
    }

    return null;
}

export default function ManageUsersPage() {
    const data = useLoaderData() as any;

    return (
        <div>
            <h1>Manage Users</h1>

            {/* ======================
                CREATE USER
            ====================== */}

            <Form method="post">
                <input
                    type="hidden"
                    name="intent"
                    value="create-user"
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                />

                <select name="role">
                    <option value="participant">
                        Participant
                    </option>

                    <option value="admin">
                        Admin
                    </option>
                </select>

                <button type="submit">
                    Add User
                </button>
            </Form>

            <hr />

            {/* ======================
                USERS LIST
            ====================== */}

            {data.users.map((user: any) => (
                <div
                    key={user.id}
                    style={{
                        display: "flex",
                        gap: "1rem",
                        marginBottom: "1rem"
                    }}
                >
                    <div>
                        #{user.id}
                    </div>

                    <div>
                        {user.username}
                    </div>

                    <div>
                        {user.profile?.role}
                    </div>

                    <Form method="post">
                        <input
                            type="hidden"
                            name="intent"
                            value="delete-user"
                        />

                        <input
                            type="hidden"
                            name="userId"
                            value={user.id}
                        />

                        <button type="submit">
                            Delete
                        </button>
                    </Form>
                </div>
            ))}
        </div>
    );
}
