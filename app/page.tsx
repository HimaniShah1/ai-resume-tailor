"use client";

import { useState } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { marked } from "marked";
import { renderResumeHTML } from "./templates/resumeTemplate";

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


const handleDownload = async () => {
  const editedMarkdown = document.getElementById("resumeEditor")?.innerText || output;
const htmlFromMd = await marked(editedMarkdown);
const htmlContent = renderResumeHTML(htmlFromMd);


  const res = await fetch("/api/download-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: htmlContent }),
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "tailored_resume.pdf";
  link.click();
};


  return (
    <Container style={{ maxWidth: 700 }} className="py-5">
      <h2 className="mb-4 fw-bold">AI Resume Tailor</h2>

      <Form.Group className="mb-3">
        <Form.Label>Upload Resume (PDF)</Form.Label>
        <Form.Control
          type="file"
          accept="application/pdf"
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
        <>
          <pre
            contentEditable
            suppressContentEditableWarning={true}
            id="resumeEditor"
            className="mt-4 p-3 bg-light border rounded"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {output}
          </pre>
         <Button variant="success" onClick={handleDownload}>
  Download PDF
</Button>
        </>
      )}
    </Container>
  );
}
