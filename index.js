// index.js
const Mustache = require('mustache');
const fs = require('fs');
const MUSTACHE_MAIN_DIR = './main.mustache';

/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
let DATA = {
    firstname: 'Julien',
    githubUsername: 'MadJlzz',
    technologies: [
        {
            alt: "Java",
            src: "https://img.shields.io/badge/-Java-E34F26?style=flat-square&logo=java&logoColor=white"
        },
        {
            alt: "Python",
            src: "https://img.shields.io/badge/-Python-FB542B?style=flat-square&logo=python&logoColor=white"
        },
        {
            alt: "Golang",
            src: "https://img.shields.io/badge/-Golang-EC4A3F?style=flat-square&logo=golang&logoColor=white"
        },
        {
            alt: "Docker",
            src: "https://img.shields.io/badge/-Docker-46a2f1?style=flat-square&logo=docker&logoColor=white",
        },
        {
            alt: "GitHub Actions",
            src: "https://img.shields.io/badge/-Github_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white"
        },
        {
            alt: "Google Cloud Platform",
            src: "https://img.shields.io/badge/-Google_Cloud_Platform-13aa52?style=flat-square&logo=google-cloud&logoColor=white"
        },
        {
            alt: "Git",
            src: "https://img.shields.io/badge/-Git-43853d?style=flat-square&logo=git&logoColor=white"
        }
    ],
    projects: [
        {
            name: "MadProbe",
            githubRepositorySuffix: "MadJlzz/madprobe",
        },
        {
            name: "MadProbe CLI",
            githubRepositorySuffix: "MadJlzz/madprobectl",
        },
        {
            name: "Gopypi",
            githubRepositorySuffix: "MadJlzz/gopypi",
        },
        {
            name: "Chaloperie",
            githubRepositorySuffix: "MadJlzz/chaloperie",
        },
    ],
    date: new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'Europe/Paris',
    }),
};

/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
function generateReadMe() {
    fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
        if (err) throw err;
        const output = Mustache.render(data.toString(), DATA);
        fs.writeFileSync('README.md', output);
    });
}

generateReadMe();