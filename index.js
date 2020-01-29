const inquirer = require('inquirer');
const Github = require('github-api');
const pdf = require("pdf-creator-node");
const { token } = require('./config');

function generatePDF({ data, color }) {
  const html =
    `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
      <style>
        html, body {
          min-height: 100%;
        }
        body {background: ${color}; }
        header {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <header class="header">
        <img src="${data.image}" />
        <h3>${data.name}</h3>
      </header>
      <h3>{{name}}</h3>
      <p>Location: ${data.location ? data.location : 'Not Provided'}</p>
      <p>Visit my Github Profile <a href="${data.url}">Here</a>
      <p>Repositories: ${data.repos}</p>
      <p>Followers: ${data.followers}</p>
      <p>Stars: ${data.stars}</p>
    </body>
  </html>`;

  const options = {
    format: 'A3',
    orientation: 'portrait'
  };

  const document = {
    html,
    data: {},
    path: './output.pdf'
  };

  pdf.create(document, options)
    .then(res => {
      console.log(res)
    })
    .catch(error => {
      console.error(error)
    });
}

async function getGithubInfo({ username, color }) {
  const gh = await new Github({ token });

  const user = await gh.getUser(username);

  const profile = await user.getProfile();
  const followers = await user.listFollowers();
  const stars = await user.listStarredRepos();

  return {
    color,
    data: {
      name: profile.data.name,
      image: profile.data.avatar_url,
      url: profile.data.url,
      repos: profile.data.public_repos,
      followers: followers.data.length,
      stars: stars.data.length
    }
  };
}


inquirer.prompt([
  {
    name: 'username',
    message: 'What is your Github username?'
  },
  {
    name: 'color',
    message: 'What color would you like for your background?'
  }
]).then(data => {
  getGithubInfo(data)
    .then(generatePDF);
});