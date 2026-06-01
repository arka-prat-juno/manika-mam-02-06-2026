// app/routes/auth/login.tsx

import { Form, redirect } from "react-router";


export async function action({ request }: any) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  console.log({
    username,
    password,
  });

  // later:
  // verify user
  // create jwt
  // set cookie

  return redirect("/dashboard/trades");
}

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>

      <Form method="post">
        <div>
          <label>Username</label>

          <input
            type="text"
            name="username"
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            name="password"
          />
        </div>

        <button type="submit">
          Login
        </button>
      </Form>
    </div>
  );
}
