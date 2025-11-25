export const renderResumeHTML = (convertedHTML: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.55;
      padding: 40px 50px;
      color: #222;
    }

    h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 20px;
      font-weight: bold;
      margin-top: 28px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #000;
    }

    h3 {
      font-size: 16px;
      margin-top: 18px;
      margin-bottom: 4px;
      font-weight: bold;
    }

    p {
      margin: 4px 0 10px 0;
      font-size: 14px;
    }

    ul {
      margin: 0 0 12px 20px;
      padding-left: 15px;
    }

    li {
      margin-bottom: 6px;
      font-size: 14px;
    }

    strong {
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${convertedHTML}
</body>
</html>
`;
