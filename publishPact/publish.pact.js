const pact = require('@pact-foundation/pact-node');
const path = require('path');
const exec =  require('child_process');
require('dotenv').config();

const gitHash = exec.execSync('git rev-parse --short HEAD').toString().trim();
let gitBranch = exec.execSync('git branch --show-current').toString().trim();
if(gitBranch === "") gitBranch = process.env.GIT_BRANCH;

const opts = {
    pactFilesOrDirs: [path.resolve(process.cwd(), `pacts/${process.env.CONSUMER_NAME}-${process.env.PROVIDER_NAME}.json`)],
    pactBroker: process.env.PACT_BROKER_URL,
    pactBrokerToken: process.env.PACT_BROKER_TOKEN,
    tags: [gitBranch],
    consumerVersion: gitHash
};

pact
    .publishPacts(opts)
    .then(() => {
        console.log('Pact contract publishing complete!');
        console.log(`Head over to ${process.env.PACT_BROKER_URL} and login with`);
        console.log('to see your published contracts.')
    })
    .catch(e => {
        console.log('Pact contract publishing failed: ', e)
    });
