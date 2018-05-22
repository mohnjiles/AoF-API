'use strict';

const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');
const rssParser = require('rss-parser');
const Sequelize = require('sequelize');

const users = require('./users');
const SteamGames = require('./steam-games');
const DKP = require('./dkp');
const DKPEvent = require('./dkp-event');
const character = require("./character");
const game = require('./games');
const news = require('./news');
const Event = require('./events');
const moment = require('moment');
const chrono = require('chrono-node');
const classes = require('./classes');


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

app.post('/api/dkp', async (req, res) => {
  let selectedUsers = req.body.selectedUsers;
  let dkpAmount = req.body.dkpAmount;
  let reason = req.body.reason;

  if (selectedUsers == null || selectedUsers.length <= 0) {
    res.status(400).send("No users selected");
    return;
  }

  let dkps = await DKP.findAll({ where: {user_id: selectedUsers}});

  for (var i = 0; i < dkps.length; i++) {
    let currentDkp = dkps[i];

    let updateValues = { dkp: parseInt(currentDkp.dkp) + parseInt(dkpAmount) };
    await currentDkp.update(updateValues).catch(e => {
      console.log(e);
      res.status(400).send(e);
    });

    await DKPEvent.create({user_id: currentDkp.user_id, dkp_change: dkpAmount, reason: reason})
      .catch(err => {
        res.status(400).send(err.code);
      });
  }
  res.status(200).send();
});

app.post('/api/news', async (req, res) => {
  let title = req.body.title;
  let content = req.body.content;

  if (title.length <= 0) {
    res.status(400).send("Title must not be empty");
    return;
  }

  if (content.length <= 0) {
    res.status(400).send("Content must not be empty");
    return;
  }

  await news.create({title: title, content: content}).catch(err => {
    res.status(400).send(err.code);
  });
  res.status(200).send();
});

app.get('/api/dkpevents/:id', async (req, res) => {
  let id = req.params.id;
  let results = await DKPEvent.findAll({where: {user_id: id}, order: Sequelize.literal('created_at DESC')});
  res.json(results);
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
  let newses = await news.findAll({order: Sequelize.literal('createdAt DESC')});
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

app.get('/api/events', async (req, res) => {
  let events = await Event.findAll({where: {
    start_time: {
      $gte: moment().toDate()
    }
  }});
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  let startTime = req.body.startTime;
  let name = req.body.name;
  let minILvl = req.body.minILvl;
  let date = chrono.parseDate(startTime);

  if (date == null) {
    res.status(400).send("Error parsing date");
    return;
  }

  await Event.create({ name: name, min_ilvl: minILvl, start_time: date }).catch(err => {
    console.log(err);
    res.status(400).send(err.code);
  });
  res.json("ok");
});

app.get('/api/job/:ids', async (req, res) => {
  let ids = req.params.ids;
  console.log(ids);
  ids = ids.split(",").map(it => parseInt(it));
  let job = await classes.findAll({where: {id: ids}});
  res.json(job);
});

app.post("/api/lodestone", async(req, res) => {
  let url = req.body.url;
  let id = req.body.id;
  let lodestoneIdRegex = /([0-9])\w+/g
  let result = url.match(lodestoneIdRegex);

  let user = await users.findOne({where: {id: id}});

  let updateValues = { lodestone_id: result[0] };
  user = await user.update(updateValues).catch(e => {
    console.log(e);
    res.status(400).send(e);
  });

  res.status(200).send("OK");
});

app.listen(3333);
console.log('Listening on localhost:3333');
