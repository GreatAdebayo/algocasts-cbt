# AlgoCasts CBT

To save each finished test into this project for AI review, run the app with:

```bash
node server.js
```

Then open `http://localhost:3030`.

The result-saving server is intentionally bound to `127.0.0.1`, so it is available only on the computer running it. Do not use it to store sensitive information.

Each time you click **Finish Test**, the attempt is saved as a JSON file in
`results/`. Your AI agent can read those files to identify topic-level strengths
and areas to practise.

If you completed a test before starting this server, open the app once through
`http://localhost:3030`; it will automatically save that queued result.
