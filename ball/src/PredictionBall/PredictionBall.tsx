import "./PredictionBall.css";
import { Button, Container, Form, Stack } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Api from "../Component/Api";

export default function PredictionBall() {
  let navigate = useNavigate();
  let userDetails: any = JSON.parse(localStorage.getItem("user") || "{}");

  const answers: string[] = [
    "Да",
    "Нет",
    "Возможно",
    "Вопрос не ясен",
    "Абсолютно точно",
    "Никогда",
    "Даже не думай",
    "Сконцентрируйся и спроси опять",
  ];
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [countQuestions, setcountQuestions] = useState();
  const [history, setHistory] = useState<string[]>([]);
  const [countVisible, setCountVisible] = useState(false);

  useEffect(() => {
    getUserHistory();
  }, [history]);

  async function getUserHistory() {
    try {
      const response = await Api.get(`api/question/${userDetails[0].Id}`);
      response.data.data.map((value: any) => {
        if (!history.includes(value.Question)) {
          setHistory((arr) => [...arr, value.Question]);
        }
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  function getQuestionCount(Question: string) {
    try {
      console.log("request");
      Api.post("api/question/count", { Question })
        .then((res) => {
          console.log("getQuestionCount Result");
          console.log(res.data.data[0].Sum);
          setcountQuestions(res.data.data[0].Sum);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  }

  async function getAnswer() {
    const randomIndex: number = Math.floor(Math.random() * answers.length);
    setAnswer(answers[randomIndex]);
    if (!history.includes(question)) {
      setHistory((arr) => [...arr, question]);
    }
    await Api.post("api/question", {
      UserId: userDetails[0].Id,
      Question: question,
    }).catch((err) => {
      console.log(err);
    });
    getQuestionCount(question);

    setCountVisible(true);
  }
  function exit() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <Container>
      <Stack direction="vertical" gap={3} className="text-center">
        <h2>Что бы получить ответ необходимо задать вопрос в текстовом поле</h2>
        <Form.Control
          type="text"
          placeholder="Введите свой вопрос"
          className="text-center"
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
            setCountVisible(false);
          }}
        />
        {countVisible ? (
          <h3>
            Вопрос: {question} задавался {countQuestions} раз
          </h3>
        ) : null}
        <Button onClick={getAnswer}>Задать вопрос</Button>
        <Button onClick={exit}>Выйти</Button>
        {answer.length > 0 ? (
          <Container>
            <h3 className="text-center">Ответ</h3>
            <h2>{answer}</h2>
          </Container>
        ) : null}
        {history.length > 0 ? (
          <Container>
            <h2>История вопросов</h2>
            {history.map((object, i) => (
              <h3 key={i} style={{ color: "green" }}>
                {object}
              </h3>
            ))}
          </Container>
        ) : null}
      </Stack>
    </Container>
  );
}
