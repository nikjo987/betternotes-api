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
    let filename = req.params.username + ".json";

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
    let filename = req.params.username + ".json";
    let body = [];
    try {
        let s3File = await s3
            .getObject({
                Bucket: process.env.BUCKET,
                Key: filename,
            })
            .promise();

        body = JSON.parse(s3File.Body.toString("utf-8"));
        body = body.filter((note) => note.timestamp !== req.body.timestamp);
        body.push(req.body);
    } catch (error) {
        if (error.code === "NoSuchKey") {
            body.push(req.body);
        } else {
            console.log(error);
            res.sendStatus(500).end();
        }
    }

    await s3
        .putObject({
            Body: JSON.stringify(body),
            Bucket: process.env.BUCKET,
            Key: filename,
        })
        .promise();

    res.set("Content-type", "text/plain");
    res.send("ok").end();
});

app.get("/notes/:username", async (req, res) => {
    let filename = req.params.username + ".json";
    try {
        let s3File = await s3
            .getObject({
                Bucket: process.env.BUCKET,
                Key: filename,
            })
            .promise();

        res.set("Content-type", "application/json");
        res.send(JSON.parse(s3File.Body.toString("utf-8"))).end();
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

app.get("/notes/:username/:noteid", async (req, res) => {
    let filename = req.params.username + ".json";
    let noteid = req.params.noteid;
    try {
        let s3File = await s3
            .getObject({
                Bucket: process.env.BUCKET,
                Key: filename,
            })
            .promise();
        
        let res = JSON.parse(s3File.Body.toString("utf-8"));
        res.set("Content-type", "application/json");
        res.send(res.filter(note => note.timestamp == noteid)[0]).end();
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

app.get("/notes/isUsernameAvailable/:username", async (req, res) => {
    let filename = req.params.username+'.json';
    
    const exists = await s3
        .headObject({
            Bucket: process.env.BUCKET,
            Key: filename,
        })
        .promise()
        .then(
            () => res.send(false).end(),
            (err) => {
                if (err.code === "NotFound") {
                    res.send(true).end();
                    return;
                }
                throw err;
            }
        );

    // try {
    //     let s3File = await s3
    //         .getObject({
    //             Bucket: process.env.BUCKET,
    //             Key: filename,
    //         })
    //         .promise();

    //     res.set("Content-type", "text/plain");
    //     res.send(false).end();
    // } catch (error) {
    //     if (error.code === "NoSuchKey") {
    //         res.send(true).end();
    //     } else {
    //         console.log(error);
    //         res.sendStatus(500).end();
    //     }
    // }
});

app.delete("/notes/:username/:noteid", async (req, res) => {
    let filename = req.params.username + ".json";
    let body = [];
    try {
        let s3File = await s3
            .getObject({
                Bucket: process.env.BUCKET,
                Key: filename,
            })
            .promise();

        body = JSON.parse(s3File.Body.toString("utf-8"));
        // body = body.filter(note => note.timestamp !== req.params.noteid);
        const findIndex = body.findIndex(a => a.timestamp == req.params.noteid)
        findIndex !== -1 && body.splice(findIndex , 1)
    } 
    catch (error) {
        if (error.code === "NoSuchKey") {
            res.sendStatus(404).end();
            return;
        } 
        else {
            console.log(error);
            res.sendStatus(500).end();
            return;
        }
    }

    await s3
        .putObject({
            Body: JSON.stringify(body),
            Bucket: process.env.BUCKET,
            Key: filename,
        })
        .promise();

    res.set("Content-type", "text/plain");
    res.send("ok").end();
});

// app.delete('',()=>{
//     await s3
//         .deleteObject({
//             Bucket: process.env.BUCKET,
//             Key: filename,
//         })
//         .promise();
// })




const port = process.env.PORT || 3000;
app.listen(port, console.log(`index.js listening at ${port}`));
