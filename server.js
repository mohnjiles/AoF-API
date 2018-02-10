'use strict';

const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');
const rssParser = require('rss-parser');

const users = require('./users');
const SteamGames = require('./steam-games');
const DKP = require('./dkp');
const character = require("./character");
const game = require('./games');
const news = require('./news');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const authCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://aof.auth0.com/.well-known/jwks.json"
    }),
    audience: 'aof',
    issuer: "https://aof.auth0.com/",
    algorithms: ['RS256']
});

app.get('/api/unprotected', (req, res) => {
  res.json(foodJokes);
})

app.get('/api/user/:email', async (req,res) => {
  let email = req.params.email;
  let user = await users.findOne({where: {email: email}});
  res.json(user);
})

app.post('/api/user', async (req, res) => {
  let name = req.body.name;
  let steamUrl = req.body.steamUrl;
  let timezone = req.body.timezone;
  let email = req.body.email;

  users.create({name: name, steam_id: steamUrl, timezone: timezone, email: email }).then(response => {
    res.json(response);
  }).catch(err => {
    if (err.code == 'ER_DUP_ENTRY') {
      res.status(400).send("User already exists");
    } else {
      res.status(400).send(err.code);
    }
  });
});

app.get('/api/user/id/:ids', async(req, res) => {
  let ids = req.params.ids;
  ids = ids.split(",").map(it => parseInt(it));
  let members = await users.findAll({ where: { id: ids }, include: [character, DKP] })
  res.json(members);
});

app.get('/api/game/:id', async (req, res) => {
  let id = req.params.id;
  let game = await SteamGames.findOne({where: {id: id}});
  res.json(game);
});

app.get('/api/dkp', async (req, res) => {
  let usrs = await users.findAll({include: [DKP]});
  usrs = usrs.map(user => {
    if (user.dkp != null)
      return user;
  });
  res.json(usrs);
});

app.get('/api/games', async (req, res) => {
  let games = await game.findAll({ where: { currently_playing: 1 } });
  res.json(games);
});

app.get('/api/news', async (req, res) => {
  let newses = await news.findAll();
  res.json(newses);
});



app.get('/api/news/ffxiv', async (req, res) => {
  const ffxivSubredditUrl = 'https://www.reddit.com/r/ffxiv/top.rss?t=week';
  const gamerEscapeUrl = 'https://gamerescape.com/category/ffxiv/feed/';
  let results = [];

  rssParser.parseURL(ffxivSubredditUrl, function(err, parsed) {

    if (err) {
      console.log(err);
      return;
    }

    let title = parsed.feed.title;
    let entries = parsed.feed.entries.slice(0, 5).map((entry, index) => {
      return { title: entry.title, url: entry.link };
    });
    results.push({ title: title, entries: entries });
    res.json(results);
    // console.log(results);
    //
    // rssParser.parseURL(gamerEscapeUrl, function(err, parsed) {
    //
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    //
    //   let title = parsed.feed.title;
    //   let entries = parsed.feed.entries.slice(0, 5).map((entry, index) => {
    //     return { title: entry.title, url: entry.link };
    //   });
    //   results.push({ title: title, entries: entries });
    //   res.json(results);
    // });
  });
});

app.listen(3333);
console.log('Listening on localhost:3333');
