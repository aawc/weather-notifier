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

function isDue(preferences) {
    const now = new Date();
    const laTimeStr = now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
    const laDate = new Date(laTimeStr);

    const [startHour, startMinute] = preferences.startTime.split(':').map(Number);
    const interval = preferences.intervalHours;

    const startRef = new Date(laDate);
    startRef.setHours(startHour, startMinute, 0, 0);

    const diffMs = laDate - startRef;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    return diffHours >= 0 && diffHours % interval === 0;
}

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
          const payload = JSON.parse(issue.body);
          const subscription = payload.subscription;
          const preferences = payload.preferences || { startTime: '07:00', intervalHours: 24 };
          
          if (isDue(preferences)) {
              console.log(`Sending to subscription from issue #${issue.number}`);
              await webpush.sendNotification(subscription, 'Trigger');
              console.log(`Sent to issue #${issue.number}`);
          } else {
              console.log(`Not due for issue #${issue.number}`);
          }
      } catch (error) {
          console.error(`Failed to process issue #${issue.number}:`, error);
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
