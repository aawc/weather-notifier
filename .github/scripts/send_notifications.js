const { Octokit } = require("@octokit/rest");
const webpush = require('web-push');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:git.bin@khaneja.org',
  vapidPublicKey,
  vapidPrivateKey
);

const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

async function run() {
  console.log(`Fetching issues for ${owner}/${repo}`);
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
  });

  const subscriptions = issues.filter(i => i.title === 'New Subscription');
  console.log(`Found ${subscriptions.length} subscriptions.`);

  for (const issue of subscriptions) {
      try {
          const subscription = JSON.parse(issue.body);
          console.log(`Sending to subscription from issue #${issue.number}`);
          
          await webpush.sendNotification(subscription, 'Trigger');
          console.log(`Sent to issue #${issue.number}`);
      } catch (error) {
          console.error(`Failed to send to issue #${issue.number}:`, error);
          if (error.statusCode === 410) {
              console.log(`Subscription expired, closing issue #${issue.number}`);
              await octokit.issues.update({
                  owner,
                  repo,
                  issue_number: issue.number,
                  state: 'closed'
              });
          }
      }
  }
}

run().catch(console.error);
