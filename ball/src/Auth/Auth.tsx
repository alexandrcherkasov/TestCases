import { Button, Container, Form, Row, Stack } from "react-bootstrap";
import "./Auth.css";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import API from "../Component/Api";
export default function Auth() {
  let navigate = useNavigate();

  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");

  function initLocalStore(token: string, user: any) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/Ball");
    setTimeout(() => {
      navigate("/");
      localStorage.clear();
    }, 3000000);
  }

  async function loginRoute(Username: any, Password: any) {
    await API.post("api/login", {
      Username,
      Password,
    })
      .then((res) => {
        if (res.status == 200) {
          const user = res.data;
          initLocalStore(res.data[0].Token, user);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
        if (error.response.data == "No Match") {
          API.post("api/register", {
            Username,
            Password,
          })
            .then((res) => {
              loginRoute(Username, Password);
            })
            .catch((error) => {
              console.log(error.response.data);
            });
        }
      });
  }

  async function authorization() {
    if (Username.length > 0 && Password.length > 0) {
      loginRoute(Username, Password);
    }
  }

  return (
    <Container className="mt-2">
      <Stack direction="vertical" gap={3}>
        <h2 className="text-center">Авторизация</h2>
        <Form.Control
          type="text"
          placeholder="Логин"
          className="text-center"
          value={Username}
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        ></Form.Control>
        <Form.Control
          type="password"
          placeholder="Пароль"
          className="text-center"
          value={Password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        ></Form.Control>
        <Button onClick={authorization}>Авторизоваться</Button>
      </Stack>
    </Container>
  );
}
