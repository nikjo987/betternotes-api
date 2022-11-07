
const express = require('express')
const cors = require('cors')

let app = express();
app.use(express.json())
app.use(express.urlencoded())

app.use(cors())
let fs = require('fs');


app.get('/', (req, res) => {
    res.send("Hello World")
})

app.post('/notes/:username', (req, res) => {
    let username = req.params.username;
    data = JSON.stringify(req.body);
    data.updatedTime = new Date();

    if(fs.existsSync(`./notes-storage/${username}`) && fs.existsSync(`./notes-storage/${username}/${req.body.timestamp}`))
        res.status(400).send('notes already create with username... Use a PUT to edit note.')
    else if(!fs.existsSync(`./notes-storage/${username}`))
        fs.mkdirSync(`./notes-storage/${username}`);
    
        fs.writeFile(
            `./notes-storage/${username}/${req.body.timestamp}`,
            data,
            "utf-8",
            (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send();
                }
                res.status(200).send(true);
            }
        );
})

app.put('/notes/:username', (req, res) => {
    data = JSON.stringify(req.body);
    data.updatedTime = new Date();

    fs.writeFile(`./notes-storage/${req.params.username}/${req.body.timestamp}`, data, 'utf-8', (err)=>{
        if(err){
            console.log(err)
            res.status(500).end();
        }
        res.status(200).send(true);
    });
})

app.get("/notes/:username", (req, res) => {
    let obj = [];

    if(!fs.existsSync(`./notes-storage/${req.params.username}`))
        res.status(400).send(`Notes not present for user - ${req.params.username}`)

    fs.readdirSync(`notes-storage/${req.params.username}`, "utf-8").forEach((filename) =>  {
        obj.push(JSON.parse(fs.readFileSync(`./notes-storage/${req.params.username}/${filename}`, "utf-8")))
    })
        res.setHeader("content-type", "application/json");
        res.status(200).send(obj);
});

app.get('/notes/isUsernameAvailable/:username', (req, res)=>{
    res.send(!fs.existsSync(`./notes-storage/${req.params.username}`))
})

app.delete('/notes/:username/:noteid', (req, res)=>{
    if(fs.existsSync(`./notes-storage/${req.params.username}`)){
        if(fs.existsSync(`./notes-storage/${req.params.username}/${req.params.noteid}`)){
            fs.rm(`./notes-storage/${req.params.username}/${req.params.noteid}`, (err) => {
                if(err){
                    res.status(200).send(false);
                    return;
                }
                res.status(200).send(true);
            });
        }
    }
})

app.listen(5000, console.log("Listening on port number 3000 ................."))