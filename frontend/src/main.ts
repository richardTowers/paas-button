import express from 'express'

const app = express()

app.all('*', (req, res, next) => {
  res.end('Hello world!')
})
app.listen(8080)