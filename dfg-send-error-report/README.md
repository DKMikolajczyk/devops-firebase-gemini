# DFG - Send error report

A simple Firebase Cloud Function whose purpose is to send email reports along with an error-fixing suggestion generated
by Gemini.

**Before deployment, fill env variables in [.env](functions/.env)**

Deploy:

```shell
firebase deploy --only functions
```

Removal (remember to remove the function after each test to avoid unnecessary billings in GCP)

```shell
firebase functions:delete sendErrorReport
```

Logs:

[https://console.cloud.google.com/run/detail/europe-west1/senderrorreport/logs](https://console.cloud.google.com/run/detail/europe-west1/senderrorreport/logs)

Build status:

[https://console.cloud.google.com/cloud-build/builds](https://console.cloud.google.com/cloud-build/builds)