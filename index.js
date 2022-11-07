const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

let app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use(cors());
let fs = require("fs");

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/notes/:username", async (req, res) => {
    let filename = req.params.username;

    await s3
        .putObject({
            Body: JSON.stringify(req.body),
            Bucket: process.env.BUCKET,
            Key: filename,
        })
        .promise();

    res.set("Content-type", "text/plain");
    res.send("ok").end();
});

app.put("/notes/:username", async (req, res) => {
    let filename = req.params.username;

    await s3
        .putObject({
            Body: JSON.stringify(req.body),
            Bucket: process.env.BUCKET,
            Key: filename,
        })
        .promise();

    res.set("Content-type", "text/plain");
    res.send("ok").end();
});

app.get("/notes/:username", async (req, res) => {
    let filename = req.params.username;

    try {
        let s3File = await s3
            .getObject({
                Bucket: process.env.BUCKET,
                Key: filename,
            })
            .promise();

        res.set("Content-type", s3File.ContentType);
        res.send(s3File.Body.toString()).end();
    } catch (error) {
        if (error.code === "NoSuchKey") {
            console.log(`No such notes present for  ${filename}`);
            res.sendStatus(404).end();
        } else {
            console.log(error);
            res.sendStatus(500).end();
        }
    }
});

app.get("/notes/isUsernameAvailable/:username", (req, res) => {
    try {
        let s3File = await s3
            .getObject({
                Bucket: process.env.BUCKET,
                Key: filename,
            })
            .promise();

        res.set("Content-type", "text/plain");
        res.send(false).end();
    } 
    catch (error) {
        if (error.code === "NoSuchKey") {
            res.send(true).end();
        } else {
            console.log(error);
            res.sendStatus(500).end();
        }
    }
});

app.delete("/notes/:username/:noteid", async (req, res) => {
    let filename = req.params.username;

    await s3
        .deleteObject({
            Bucket: process.env.BUCKET,
            Key: filename,
        })
        .promise();

    res.set("Content-type", "text/plain");
    res.send("ok").end();
});

const port = process.env.PORT || 3000;
app.listen(port, console.log(`index.js listening at ${port}`));
