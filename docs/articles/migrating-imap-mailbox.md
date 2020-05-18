# Migrating emails from a server to another

I was managing the mail server for my local scouting group and we have
approximately a hundred email addresses each with a dedicated space with up
to 2Go of emails. Leaving the group I wished to switch and use the services
of a professional email provider rather than staying on our small server.

## The cost of migrating mails
The problem was about migrating these mailboxes along with email accounts. Multiple
companies offer services to migrate emails from a server to another, but it can cost
a lot, and even 500$ is not a small price to pay for a scouting group. I had to find
another solution, for example using open source softwares or building my own. 
Surprisingly I didn't find any free solution that would do what I needed, so I decided
to develop a set of scripts to help me do it.

## Before migrating
Migrating an email address from a server to another requires a few points to be fullfilled:
- First you need to know the host and port of the old server and destination server
- You need to know the origin email address as well as destination email address. In my case
it was a 1:1 mapping, so I first had to replicate all migrated addresses
- You need to know the password of the origin email address as well as the password of the
destination one, required to perform read and write operations on both of them

::: warning Accessing both servers
Please note that both mail servers should be adressables independently of any DNS issue. For
example in my case, the MX record of my domain name was mapped to the old server, but the email
provider of the new one has his own.
:::

## Migrating emails
In order to migrate emails we have to know which tools and protocols we can use.

### What should the script do
In order to work the script should be able to:
1. Manage mailboxes on both servers
1. Read emails from the old server
2. Write emails on the destination server
We actually don't need anything else, that's enough to migrate emails.

### IMAP
The Internet Message Access Protocol is responsible to allow access to emails stored on mail servers.
It is used by every webmail and email software to list your emails, show their content, download their
attached items and so on. It's one of the two protocols required to use emails along with SMTP
(simple mail transfer protocol) which is used to transfer and deliver emails.

::: tip The POP protocol
There actually exist two protocols to read emails, SMTP and POP. Today SMTP is mostly used, the main
difference between the two of them is that SMTP allows you to read emails remotely, they stay on the
server, while POP will download them on your client, making it impossible to check emails from
your phone and your computer for example.
:::

### What's a mailbox
You probably already created "folders" in your webmail, move some mails in them and even create
special rules so that when an email arrives, if its subject contains "newsletter X" move it to Spam. Those
folders are actually part of the IMAP protocol and emails are (virtually) stored in them. When you
connect to a mail server using IMAP, you have to *open* a mailbox to read and write emails in it.

#### Children mailbox
You also have the possibility to have children mailboxes in a given mailbox. They can
be accessed using paths, for example `INBOX/my-custom-box/another-subbox`, but note that the separator
(here the `/` character) can be different from a mail server to another.

## Building the script
To help me migrate my email addresses I developed a small script in Javascript which is detailed
here.

### Writing a small IMAP client
I wrote a small IMAP client class to help me building my script which allowed me to promisify multiple
operations offered by the underlying low level client. I used [the imap package](https://www.npmjs.com/package/imap)
as base client and built upon it. The code of the client is [available here](https://gist.github.com/ovesco/10a31ef37be5d69b09314c3c33a9a40d#file-imapclient-js) 
if you want to check it, but as it's not required for the comprehension of this post I won't detail it here.

### Connecting to both servers
The first step we have to do is connect to both the old and the new mail servers.
```javascript
// The small client detailed in the previous point
const client = require('./client');

// Main async block, all code detailed after is located in it
(async () => {
    const fromClient = new Client({
        user: 'email@address.com',
        password: 'potatoes',
        host: 'my.old.email-server.host', // IMAP host
        port: 143 // IMAP port
    });

    const destinationClient = new Client({
        user: 'email@address.com',
        password: 'potatoes',
        host: 'my.NEW.email-server.host', // IMAP host
        port: 143 // IMAP port
    });

    try {
        await fromClient.connect();
        await destinationClient.connect();
    } catch (e) {
        console.error(e);
    }
});
```

### Checking if all required mailboxes exist on both servers
To migrate mails we have to know all the mailboxes that exist on the old server,
and in which mailbox to write on the destination server. In my case, for each mailbox
on the old server I created a same one on the destination one if it didn't exist.

::: tip default mailboxes
Some mailboxes are available by default, among them we can find the INBOX and TRASH ones.
:::

```javascript
// Mailboxes on the old server
const allFromBoxs = await fromClient.getBoxes();

// Existing mailboxes on the new server
const allDestBoxs = await destinationClient.getBoxes();

// This will list all mailboxes that exist on the old server but not on the new server,
// including child ones
const boxToCreate = [];

// This will list all mailboxes to migrate, with a mapping from the old server
// mailbox to the destination server one, with respect for children mailboxes, 
// path and separator. In my case I only migrated the inbox, sent messages and 
// drafts. The script will populate this object with all additional children 
// mailbox from currently listed ones.
const migratedMailboxes = {
    INBOX: 'INBOX',
    Drafts: 'Drafts',
    Sent: 'Sent',
};

/**
 * Recursive function to explore all children mailboxes of given one
 * @param fromBox object which contains the old server mailbox children and delimiter
 * @param fromPath mailbox path on the old server
 * @param destPath current path on the destination server
 * @param destDelimiter mailbox path delimiter on the destination server
 */
const explore = (fromBox, fromPath, destPath, destDelimiter) => {

    // Check if there's children to scan
    if (fromBox.children !== undefined && fromBox.children !== null) {

        // Iterate on each child mailbox, giving us its name and mailbox object
        Object.keys(fromBox.children).forEach((childBoxName) => {
            const childBox = fromBox.children[childBoxName];
            
            // build oldServer mailbox path
            const oldPath = `${fromPath}${fromBox.delimiter}${childBoxName}`;

            // build destination server mailbox path
            const destinationPath = `${destPath}${destDelimiter}${childBoxName}`;

            // Add mailbox path to mailbox to create on destination server
            boxToCreate.push(destinationPath);

            // add mailbox path to mailbox to migrate
            migratedMailboxes[oldPath] = destinationPath;

            // Keep on children exploration
            explore(childBox, oldPath, destinationPath, destDelimiter);
        });
    }
};

// Start exploration of children mailbox
Object.keys(migratedMailboxes).forEach((fromBoxName) => {

    // Retrieve delimiter for given mailbox on destination server
    const delimiter = allDestBoxs[migratedMailboxes[fromBoxName]].delimiter;

    // Explore this mailbox
    explore(allFromBoxs[fromBoxName], fromBoxName,
        migratedMailboxes[fromBoxName], delimiter);
});
```

This piece of code can appear complex but it's not in reality. All it does is
- list all mailboxes on the old server
- list all mailboxes on the new server
- take the list of initial mailboxes to migrate (in `migratedMailboxes`) and
start looking for eventual children mailboxes in each of them

### Creating missing mailboxes on destination server
Once we have the list of mailboxes that are missing from the destination server,
we can start creating them.

```javascript
// Create all missing mailboxes on destination server
await boxToCreate.reduce((acc, nextBoxToCreate) =>
    acc.then(() => new Promise((resolve) => {
        destinationClient.addBox(nextBoxToCreate).then(() => {

            // Don't forget to subscribe to the newly created mailbox,
            // otherwise it won't be readable from any client
            destinationClient.suscribeBox(nextBoxToCreate).then(() => {
                console.log('Suscribed to ' + nextBoxToCreate);
                resolve();
            });
        });
    })),
Promise.resolve());
```

::: tip Performing async tasks in order
Please note the usage of the `await boxToCreate.reduce(...)` with `Promise.resolve()` given to
the reduce function which allows us to perform a set of async tasks one after the other, waiting
for the previous one every time.
:::

### Performing migration of each mailbox one
Once all required mailboxes are created we can start iterating over them.
```javascript {8,9,10}
// Iterate over each mailbox to migrate
Object.keys(migratedMailboxes).reduce((acc, nextBox) => acc.then(() =>new Promise((resolveMailbox) => {
    // Open mailbox on destination server client
    destinationClient.openBox(migratedMailboxes[nextBox]).then((destinationBox) => {

        // Open mailbox on old server client
        fromClient.openBox(nextBox).then((fromBox) => {
            // Here both clients have opened correct mailboxes
            // All next presented code samples are going here
            // [...]
        });
    });
})), Promise.resolve()).then(() => {
    fromClient.close();
    destinationClient.close();
});
```

As you can see we're using the `reduce` along with `Promise.resolve()` function to iterate over
each mailbox, migrate it and go on the next once done, one after the other.

### Reading emails from the mailbox
In order to retrieve mails from a mailbox you can perform some search queries on it. I used the
`SINCE January 01, 2000` query to retrieve all emails since in 2000 we didn't have any server, I'm sure
to take all of them.

