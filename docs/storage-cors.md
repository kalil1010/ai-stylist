# Firebase Storage CORS Setup

Deploy these rules once per project to allow the production site to upload to Storage directly.

## Prerequisites

- Google Cloud SDK (`gcloud` + `gsutil`) or Firebase CLI 12+
- Admin rights on project `ai-stylist-app-fcb50`

## Apply the rules

```bash
# Authenticate if needed
# gcloud auth login

# Update the CORS policy
cd $(git rev-parse --show-toplevel)
gsutil cors set config/storage-cors.json gs://ai-stylist-app-fcb50.appspot.com
```

If you maintain staging or preview domains, add them to `origin` in `config/storage-cors.json` and re-run the command. Changes propagate in a few minutes.
