//손수민 202239895
//웹DB 2주차 과제
const express = require('express');
const app = express();
const port = 3000;
// 기본 URL에서 책과 음악을 표시
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>웹DB 2주차 과제</title>
        <style>
          .hover-message {
            display: none;
            position: absolute;
            background-color: lightblue;
          }
        </style>
      </head>
      <body>
        <h1>책과 음악이 있는 곳</h1>
        <hr>
        <h3>
          <a href="/BOOK" id="book-link">1. 책</a>
          <span class="hover-message" id="book-message">127.0.0.1:3000/BOOK</span>
        </h3>
        <h3>
          <a href="/MUSIC" id="music-link">2. 음악</a>
          <span class="hover-message" id="music-message">127.0.0.1:3000/MUSIC</span>
        </h3>

        <script>
          // 책 링크에 마우스를 올렸을 때 메시지 표시
          document.getElementById('book-link').addEventListener('mouseover', function() {
            document.getElementById('book-message').style.display = 'inline';
          });
          document.getElementById('book-link').addEventListener('mouseout', function() {
            document.getElementById('book-message').style.display = 'none';
          });

          // 음악 링크에 마우스를 올렸을 때 메시지 표시
          document.getElementById('music-link').addEventListener('mouseover', function() {
            document.getElementById('music-message').style.display = 'inline';
          });
          document.getElementById('music-link').addEventListener('mouseout', function() {
            document.getElementById('music-message').style.display = 'none';
          });
        </script>
      </body>
    </html>
  `);
});
// 책을 클릭했을 때의 페이지
app.get('/BOOK', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>웹DB 2주차 과제</title>
      </head>
      <body>
        <h1><a href="/">책과 음악이 있는곳</h1>
        <hr>
        <h3>1. 책</h3>
        <ul>
          <li>총균쇠</li>
          <li>내면소통</li>
        </ul>
        <h3>2. <a href="/MUSIC">음악</a></h3>
      </body>
    </html>
  `);
});
// 음악을 클릭했을 때의 페이지
app.get('/MUSIC', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>웹DB 2주차 과제</title>
        </head>
        <body>
          <h1><a href="/">책과 음악이 있는곳</h1>
          <hr>
          <h3>1. <a href="/BOOK">책</a></h3>
          <h3>2. 음악</h3>
          <ul>
          <li>바빌론 강가에서</li>
          <li>I'll be missing you</li>
          </ul>
        </body>
      </html>
    `);
  });
app.listen(port, () => {
  console.log(`서버가 http://127.0.0.1:${port} 에서 실행 중입니다.`);
});