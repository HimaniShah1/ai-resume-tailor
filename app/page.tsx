"use client";

import { useState } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!resume || !jd.trim()) return alert("Upload resume + JD");

    setLoading(true);

    const form = new FormData();
    form.append("resume", resume);
    form.append("jobDescription", jd);

    const res = await fetch("/api/tailor", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setOutput(data.tailoredResume);
    setLoading(false);
  };

  return (
    <Container style={{ maxWidth: 700 }} className="py-5">
      <h2 className="mb-4 fw-bold">AI Resume Tailor</h2>

      <Form.Group className="mb-3">
        <Form.Label>Upload Resume (PDF)</Form.Label>
        <Form.Control
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] ?? null;
            setResume(file);
          }}
        />{" "}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Paste Job Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />
      </Form.Group>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Tailor Resume"}
      </Button>

      {output && (
        <pre
          className="mt-4 p-3 bg-light border rounded"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {output}
        </pre>
      )}
    </Container>
  );
}
